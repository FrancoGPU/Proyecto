const pool = require('../config/db');
const bcrypt = require('bcrypt');

const userController = {
    // Obtener perfil del usuario
    getProfile: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            
            // Obtener datos del usuario con estadísticas
            const userQuery = `
                SELECT 
                    u.*,
                    ur.discount_percentage,
                    ur.points_multiplier,
                    ur.description as rank_description,
                    ur.rank_color,
                    COUNT(DISTINCT p.id) as total_purchases,
                    COALESCE(SUM(p.total_final), 0) as total_spent,
                    0 as favorites_count
                FROM users u
                LEFT JOIN user_ranks ur ON u.user_rank = ur.rank_name
                LEFT JOIN purchases p ON u.id = p.user_id
                WHERE u.id = $1
                GROUP BY u.id, ur.discount_percentage, ur.points_multiplier, ur.description, ur.rank_color
            `;
            
            const result = await pool.query(userQuery, [userId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            const user = result.rows[0];
            
            // Remover datos sensibles
            delete user.password;
            
            res.json(user);
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Actualizar perfil del usuario
    updateProfile: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            const { phone, birthDate, currentPassword, newPassword } = req.body;

            // Si se quiere cambiar la contraseña, verificar la actual
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({ message: 'Contraseña actual requerida' });
                }

                // Verificar contraseña actual
                const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
                const user = userResult.rows[0];
                
                const isValidPassword = await bcrypt.compare(currentPassword, user.password);
                if (!isValidPassword) {
                    return res.status(400).json({ message: 'Contraseña actual incorrecta' });
                }

                // Encriptar nueva contraseña
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                await pool.query(
                    'UPDATE users SET phone = $1, birth_date = $2, password = $3 WHERE id = $4',
                    [phone, birthDate, hashedPassword, userId]
                );
            } else {
                // Solo actualizar otros campos
                await pool.query(
                    'UPDATE users SET phone = $1, birth_date = $2 WHERE id = $3',
                    [phone, birthDate, userId]
                );
            }

            res.json({ message: 'Perfil actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener rangos de usuario
    getRanks: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM user_ranks ORDER BY min_points ASC');
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener rangos:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener historial de puntos
    getPointsHistory: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            const { type } = req.query;

            let query = `
                SELECT ph.*
                FROM points_history ph
                WHERE ph.user_id = $1
            `;
            
            const params = [userId];
            
            if (type && type !== 'all') {
                query += ' AND ph.points_type = $2';
                params.push(type);
            }
            
            query += ' ORDER BY ph.created_at DESC LIMIT 50';

            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener historial de puntos:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener historial de compras
    getPurchases: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            const { startDate, endDate, type } = req.query;

            let query = `
                SELECT p.*, m.title as movie_title, tr.name as room_name,
                       ph.points_earned
                FROM purchases p
                LEFT JOIN movies m ON p.movie_id = m.id
                LEFT JOIN theater_rooms tr ON p.room_id = tr.id
                LEFT JOIN points_history ph ON p.id = ph.reference_id 
                    AND ph.points_type = 'purchase'
                WHERE p.user_id = $1
            `;
            
            const params = [userId];
            let paramCount = 1;

            if (startDate) {
                paramCount++;
                query += ` AND p.created_at >= $${paramCount}`;
                params.push(startDate);
            }

            if (endDate) {
                paramCount++;
                query += ` AND p.created_at <= $${paramCount}`;
                params.push(endDate);
            }

            if (type && type !== 'all') {
                paramCount++;
                query += ` AND p.purchase_type = $${paramCount}`;
                params.push(type);
            }

            query += ' ORDER BY p.created_at DESC';

            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener historial de compras:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Subir imagen de perfil
    uploadProfileImage: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            // Aquí iría la lógica para subir archivo
            // Por simplicidad, asumimos que se usa un servicio como multer
            const imageUrl = req.file ? `/uploads/profiles/${req.file.filename}` : null;
            
            if (!imageUrl) {
                return res.status(400).json({ message: 'No se proporcionó imagen' });
            }

            const userId = req.session.user.id;
            await pool.query('UPDATE users SET profile_image = $1 WHERE id = $2', [imageUrl, userId]);

            res.json({ imageUrl });
        } catch (error) {
            console.error('Error al subir imagen:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Actualizar imagen de perfil (URL predeterminada)
    updateProfileImage: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const { imageUrl } = req.body;
            const userId = req.session.user.id;

            await pool.query('UPDATE users SET profile_image = $1 WHERE id = $2', [imageUrl, userId]);

            res.json({ imageUrl });
        } catch (error) {
            console.error('Error al actualizar imagen:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Generar factura
    generateInvoice: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            const {
                documentType,
                buyerName,
                buyerDocument,
                buyerEmail,
                buyerPhone,
                paymentMethod,
                companyName,
                companyRuc,
                companyAddress,
                purchaseData,
                totals
            } = req.body;

            // Generar número de documento
            const documentNumber = await generateInvoiceNumber();

            // Crear registro de factura
            const invoiceResult = await pool.query(`
                INSERT INTO invoices (
                    user_id, invoice_number, subtotal, tax_amount, 
                    discount_amount, total_amount, invoice_type, 
                    payment_method, company_name, company_ruc, 
                    company_address, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
                RETURNING *
            `, [
                userId, documentNumber, totals.subtotal, totals.taxAmount,
                totals.discountAmount, totals.total, documentType,
                paymentMethod, companyName, companyRuc, companyAddress
            ]);

            const invoice = invoiceResult.rows[0];

            // Agregar items de la factura
            if (purchaseData.items) {
                for (const item of purchaseData.items) {
                    await pool.query(`
                        INSERT INTO invoice_items (
                            invoice_id, item_type, item_id, item_name,
                            quantity, unit_price, total_price, description
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [
                        invoice.id, item.type, item.id, item.name,
                        item.quantity, item.price, item.price * item.quantity,
                        item.description
                    ]);
                }
            }

            // Preparar respuesta con datos para el documento
            const responseData = {
                documentNumber,
                documentType,
                invoiceId: invoice.id,
                buyerName,
                buyerDocument,
                buyerEmail,
                buyerPhone,
                paymentMethod,
                companyName,
                companyRuc,
                companyAddress,
                items: purchaseData.items,
                totals,
                createdAt: invoice.created_at
            };

            res.json(responseData);
        } catch (error) {
            console.error('Error al generar factura:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Confirmar compra
    confirmPurchase: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            const { documentType, purchaseData, invoiceData } = req.body;

            // Iniciar transacción
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');

                // Crear registro de compra
                const purchaseResult = await client.query(`
                    INSERT INTO purchases (
                        user_id, movie_id, room_id, seats, showtime,
                        subtotal, total, payment_method, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
                    RETURNING *
                `, [
                    userId,
                    purchaseData.movieId,
                    purchaseData.roomId || 1,
                    JSON.stringify(purchaseData.seats || []),
                    purchaseData.showtime,
                    purchaseData.totals.subtotal,
                    purchaseData.totals.total,
                    invoiceData.paymentMethod
                ]);

                const purchase = purchaseResult.rows[0];

                // Actualizar estado de factura si existe
                if (invoiceData.invoiceId) {
                    await client.query(
                        'UPDATE invoices SET status = $1 WHERE id = $2',
                        ['paid', invoiceData.invoiceId]
                    );
                }

                // Agregar puntos al usuario
                const pointsEarned = purchaseData.totals.pointsToEarn || 0;
                if (pointsEarned > 0) {
                    await client.query(
                        'SELECT add_points_to_user($1, $2, $3, $4, $5)',
                        [
                            userId, 
                            pointsEarned, 
                            'purchase', 
                            purchase.id,
                            `Compra de ${purchaseData.movieTitle || 'película'}`
                        ]
                    );
                }

                await client.query('COMMIT');

                res.json({
                    purchaseId: purchase.id,
                    message: 'Compra confirmada exitosamente',
                    pointsEarned
                });

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            console.error('Error al confirmar compra:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener compras del usuario
    getUserPurchases: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            
            const result = await pool.query(`
                SELECT 
                    p.*
                FROM purchases p
                WHERE p.user_id = $1
                ORDER BY p.purchase_date DESC
                LIMIT 50
            `, [userId]);

            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener compras del usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener puntos del usuario
    getUserPoints: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            
            const result = await pool.query(`
                SELECT 
                    u.total_points,
                    u.current_points,
                    ur.name as rank_name,
                    ur.min_points,
                    ur.benefits,
                    (SELECT name FROM user_ranks WHERE min_points > u.total_points ORDER BY min_points ASC LIMIT 1) as next_rank,
                    (SELECT min_points FROM user_ranks WHERE min_points > u.total_points ORDER BY min_points ASC LIMIT 1) as next_rank_points
                FROM users u
                LEFT JOIN user_ranks ur ON u.total_points >= ur.min_points
                WHERE u.id = $1
                ORDER BY ur.min_points DESC
                LIMIT 1
            `, [userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const userPoints = result.rows[0];
            const pointsToNext = userPoints.next_rank_points ? 
                userPoints.next_rank_points - userPoints.total_points : 0;

            res.json({
                ...userPoints,
                points_to_next_rank: pointsToNext
            });
        } catch (error) {
            console.error('Error al obtener puntos del usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Obtener rango del usuario
    getUserRank: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.session.user.id;
            
            const result = await pool.query(`
                SELECT 
                    ur.name as rank_name,
                    ur.icon,
                    ur.color,
                    ur.benefits,
                    ur.min_points,
                    u.total_points,
                    (SELECT name FROM user_ranks WHERE min_points > u.total_points ORDER BY min_points ASC LIMIT 1) as next_rank,
                    (SELECT min_points FROM user_ranks WHERE min_points > u.total_points ORDER BY min_points ASC LIMIT 1) as next_rank_points
                FROM users u
                LEFT JOIN user_ranks ur ON u.total_points >= ur.min_points
                WHERE u.id = $1
                ORDER BY ur.min_points DESC
                LIMIT 1
            `, [userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener rango del usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

  // Suscripción al newsletter
  subscribeNewsletter: async (req, res) => {
    try {
      const { email, name, preferences } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email válido es requerido' 
        });
      }

      const result = await pool.query(
        'SELECT subscribe_to_newsletter($1, $2, $3) as result',
        [email, name || null, preferences || null]
      );

      const subscriptionResult = result.rows[0].result;
      
      if (subscriptionResult.success) {
        res.status(200).json(subscriptionResult);
      } else {
        res.status(400).json(subscriptionResult);
      }
    } catch (error) {
      console.error('Error en suscripción newsletter:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }
};

// Función auxiliar para generar número de factura
async function generateInvoiceNumber() {
    const result = await pool.query('SELECT generate_invoice_number() as number');
    return result.rows[0].number;
}

module.exports = userController;
