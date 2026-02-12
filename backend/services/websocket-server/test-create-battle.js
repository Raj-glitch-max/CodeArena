const axios = require('axios');

async function testCreateBattle() {
    try {
        console.log('Creating test users...');
        const user1 = await axios.post('http://localhost:3001/api/auth/register', {
            username: 'battle_test_1_' + Date.now(),
            email: 'battle_test_1_' + Date.now() + '@example.com',
            password: 'password123'
        });
        const user2 = await axios.post('http://localhost:3001/api/auth/register', {
            username: 'battle_test_2_' + Date.now(),
            email: 'battle_test_2_' + Date.now() + '@example.com',
            password: 'password123'
        });

        const player1Id = user1.data.user.id;
        const player2Id = user2.data.user.id;
        console.log(`Created users: ${player1Id}, ${player2Id}`);

        console.log('Testing create battle...');
        const response = await axios.post('http://localhost:3002/api/battles', {
            player1Id,
            player2Id,
            mode: '1v1',
            difficulty: 'easy'
        });
        console.log('Success - Battle Created:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

testCreateBattle();
