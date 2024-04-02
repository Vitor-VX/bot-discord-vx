const { Client, GatewayIntentBits } = require('discord.js');
const { createUser, resetLogin, blockLogin, getAllUsers } = require('../database/models');
require('dotenv').config();

require('../database/database')();

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log('Bot está online!');
});

const cargoID = '1222678114157461534';

client.on('guildMemberAdd', member => {
    console.log(`Novo membro entrou: ${member.user.tag}`);

    // Verifica se o membro possui a tag "login create"
    const loginCreateRole = member.guild.roles.cache.find(role => role.name === 'login create');
    if (loginCreateRole && member.roles.cache.has(loginCreateRole.id)) {
        const cargo = member.guild.roles.cache.get(cargoID);
        if (cargo) {
            member.roles.add(cargo)
                .then(() => console.log(`Cargo '${cargo.name}' atribuído para ${member.user.tag}.`))
                .catch(error => console.error('Erro ao atribuir cargo:', error));
        } else {
            // console.error(`Cargo com ID '${cargoID}' não encontrado.`);
        }
    } else {
        // console.log(`${member.user.tag} não tem a tag "login create".`);
    }
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!Teste')) {
        message.channel.send("Olá!");
    }
    // console.log(message.content);
});

const sendMensage = (msg, interaction) => {
    interaction.reply({
        content: msg
    });
}

client.on('interactionCreate', interaction => {
    if (!client.readyAt) return;

    const { commandName, options, member } = interaction;

    const hasLoginCreateRole = member.roles.cache.some(role => role.name === 'Login Create');

    switch (interaction.commandName) {
        case 'comprar':
            sendMensage("Enviado!", interaction);
            break;
        case 'login':
            if (!hasLoginCreateRole) {
                sendMensage("Você não tem permissão para gerenciar login's.", interaction);
                break;
            }

            const nome = options.getString('nome');
            const senha = options.getString('senha');

            if (!nome || !senha) {
                sendMensage("Campos vazios.", interaction);
                break;
            }

            createUser(nome, senha)
                .then(res => {
                    sendMensage("Usuário criado com sucesso: " + res, interaction);
                })
                .catch(err => {
                    console.error('Erro ao criar usuário:', err);
                    sendMensage("Erro ao criar usuário.", interaction);
                });
            break;
        case 'reset':
            if (!hasLoginCreateRole) {
                sendMensage("Você não tem permissão para gerenciar login's.", interaction);
                break;
            }

            const loginResetName = options.getString('nome');

            if (!loginResetName) {
                sendMensage("Campos vazios.", interaction);
                break;
            }

            resetLogin(loginResetName)
                .then(res => {
                    sendMensage(res, interaction);
                })
                .catch(err => {
                    console.error('Erro ao criar resetar o usúario:', err);
                    sendMensage("Erro ao resetar o login.", interaction);
                });
            break;
        case 'block':
            if (!hasLoginCreateRole) {
                sendMensage("Você não tem permissão para gerenciar login's.", interaction);
                break;
            }

            const loginBlockName = options.getString('nome');

            if (!loginBlockName) {
                sendMensage("Campos vazios.", interaction);
                break;
            }

            blockLogin(loginBlockName)
                .then(res => {
                    sendMensage(res, interaction);
                })
                .catch(err => {
                    console.error('Erro ao criar bloquear o usúario:', err);
                    sendMensage("Erro ao bloquear o login.", interaction);
                });
            break;
        case 'users':
            if (!hasLoginCreateRole) {
                sendMensage("Você não tem permissão para gerenciar login's.", interaction);
                break;
            }

            getAllUsers()
            .then(res => {
                sendMensage("**Todos os usúarios:**\n\n" + res, interaction);
            })
            .catch(err => {
                sendMensage("Erro ao buscar todos os usuários.", interaction);
            });
    }
});

client.login(process.env.TOKEN);
