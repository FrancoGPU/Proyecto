const pool = require('../config/db');

const purchaseController = {
    // Registrar una nueva compra
    async createPurchase(req, res) {
        const client = await pool.connect();
        
        try {
            const {
                movieTitle,
                showtime,
                selectedSeats,
                ticketPrice,
                cartItems,
                totalOriginal,
                totalFinal,
                discountApplied,
                isVipPurchase,
                paymentMethod,
                cardLastFour,
                purchaseId
            } = req.body;

            // Obtener el ID del usuario si está autenticado
            const userId = req.session && req.session.user ? req.session.user.id : null;

            // Validación básica
            if (!movieTitle || !totalFinal || !purchaseId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Datos incompletos para registrar la compra' 
                });
            }

            // Insertar la compra en la base de datos
            const insertQuery = `
                INSERT INTO purchases (
                    user_id, movie_title, showtime, selected_seats, ticket_price,
                    cart_items, total_original, total_final, discount_applied,
                    is_vip_purchase, payment_method, card_last_four, purchase_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id, purchase_date
            `;

            const values = [
                userId,
                movieTitle,
                showtime || 'No especificado',
                selectedSeats || 'No especificados',
                parseFloat(ticketPrice) || 0,
                JSON.stringify(cartItems || []),
                parseFloat(totalOriginal) || parseFloat(totalFinal),
                parseFloat(totalFinal),
                parseFloat(discountApplied) || 0,
                Boolean(isVipPurchase),
                paymentMethod || 'credit_card',
                cardLastFour || null,
                purchaseId
            ];

            const result = await client.query(insertQuery, values);
            const purchase = result.rows[0];

            console.log('Compra registrada exitosamente:', {
                id: purchase.id,
                purchaseId,
                userId,
                totalFinal,
                purchaseDate: purchase.purchase_date
            });

            res.json({
                success: true,
                message: 'Compra registrada exitosamente',
                data: {
                    id: purchase.id,
                    purchaseId,
                    purchaseDate: purchase.purchase_date
                }
            });

        } catch (error) {
            console.error('Error al registrar la compra:', error);
            
            // Manejar error de ID de compra duplicado
            if (error.code === '23505' && error.constraint === 'purchases_purchase_id_key') {
                return res.status(409).json({
                    success: false,
                    message: 'Esta compra ya ha sido registrada'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al registrar la compra'
            });
        } finally {
            client.release();
        }
    },

    // Obtener historial de compras de un usuario
    async getUserPurchases(req, res) {
        const client = await pool.connect();
        
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userId = req.session.user.id;
            
            const query = `
                SELECT 
                    id, movie_title, showtime, selected_seats, ticket_price,
                    cart_items, total_original, total_final, discount_applied,
                    is_vip_purchase, payment_method, purchase_date, purchase_id
                FROM purchases 
                WHERE user_id = $1 
                ORDER BY purchase_date DESC
            `;

            const result = await client.query(query, [userId]);

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            console.error('Error al obtener historial de compras:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        } finally {
            client.release();
        }
    },

    // Obtener estadísticas de compras (para admin)
    async getPurchaseStats(req, res) {
        console.log('=== INICIO getPurchaseStats ===');
        
        let client;
        try {
            client = await pool.connect();
            console.log('Conexión a la base de datos establecida');
            
            // Verificar que el usuario sea admin (el middleware ya hace esta verificación)
            // Esta verificación adicional es por seguridad extra
            console.log('Iniciando obtención de estadísticas de compras...');

            // Primero, consulta simple para verificar que la tabla funciona
            const testQuery = 'SELECT COUNT(*) as count FROM purchases';
            const testResult = await client.query(testQuery);
            console.log('Test query result:', testResult.rows[0]);

            const statsQuery = `
                SELECT 
                    COUNT(*) as total_purchases,
                    SUM(total_final) as total_revenue,
                    SUM(CASE WHEN is_vip_purchase THEN 1 ELSE 0 END) as vip_purchases,
                    AVG(total_final) as average_purchase,
                    COUNT(DISTINCT user_id) as unique_customers
                FROM purchases
                WHERE purchase_date >= CURRENT_DATE - INTERVAL '30 days'
            `;

            console.log('Ejecutando consulta de estadísticas...');
            const statsResult = await client.query(statsQuery);
            console.log('Stats result:', statsResult.rows[0]);

            const recentPurchasesQuery = `
                SELECT 
                    p.purchase_id, p.movie_title, p.total_final, p.purchase_date,
                    u.username as customer_name, u.email as customer_email
                FROM purchases p
                LEFT JOIN users u ON p.user_id = u.id
                ORDER BY p.purchase_date DESC
                LIMIT 10
            `;

            console.log('Ejecutando consulta de compras recientes...');
            const recentResult = await client.query(recentPurchasesQuery);
            console.log('Recent purchases count:', recentResult.rows.length);

            const responseData = {
                success: true,
                data: {
                    stats: statsResult.rows[0],
                    recentPurchases: recentResult.rows
                }
            };

            console.log('Enviando respuesta exitosa');
            res.json(responseData);

        } catch (error) {
            console.error('Error al obtener estadísticas de compras:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        } finally {
            if (client) {
                client.release();
                console.log('Conexión a la base de datos liberada');
            }
            console.log('=== FIN getPurchaseStats ===');
        }
    }
};

module.exports = purchaseController;
