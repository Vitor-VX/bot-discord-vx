const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'login', 
        description: 'Login com nome de usuário e senha.',
        options: [
            {
                name: 'nome',
                description: 'Seu nome de usuário.',
                type: 3, 
                required: true, 
            },
            {
                name: 'senha',
                description: 'Sua senha.',
                type: 3, 
                required: true, 
            },
        ],
    },

    {
        name: 'reset',
        description: 'Resetar login do usúario.',
        options: [
            {
                name: 'nome',
                description: 'Nome de usuário.',
                type: 3, 
                required: true, 
            }
        ]
    },
    
    {
        name: 'block',
        description: 'Bloquear login do usúario.',
        options: [
            {
                name: 'nome',
                description: 'Nome de usuário.',
                type: 3, 
                required: true,
            }
        ]
    },

    {
        name: 'users',
        description: 'Obter todos os usúarios.',
    },

    {
        name: 'comprar',
        description: 'Comando para comprar login.',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Iniciando atualização dos comandos de aplicativo (/).');
        await rest.put(Routes.applicationCommands(''), { body: commands });
        console.log('Comandos de aplicativo (/) atualizados com sucesso.');
    } catch (error) {
        console.error(error);
    }
})();
