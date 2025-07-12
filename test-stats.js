const fetch = require('node-fetch');

async function testStatsEndpoint() {
    try {
        console.log('=== PROBANDO ENDPOINT DE ESTADÍSTICAS ===');
        
        // Simular login como admin primero
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@gocine.com',
                password: 'admin123'
            })
        });
        
        console.log('Login status:', loginResponse.status);
        
        if (!loginResponse.ok) {
            const loginError = await loginResponse.text();
            console.log('Login error:', loginError);
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('Login successful:', loginData.user);
        
        // Obtener cookies de sesión
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('Session cookies:', cookies);
        
        // Probar el endpoint de estadísticas
        const statsResponse = await fetch('http://localhost:3000/api/admin/purchases/stats', {
            method: 'GET',
            headers: {
                'Cookie': cookies || ''
            }
        });
        
        console.log('Stats endpoint status:', statsResponse.status);
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('Stats data:', JSON.stringify(statsData, null, 2));
        } else {
            const error = await statsResponse.text();
            console.log('Stats error:', error);
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testStatsEndpoint();
