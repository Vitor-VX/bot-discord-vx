const mongoose = require("mongoose");

function getData(valorDias) {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + (valorDias - 1) * 24 * 60 * 60 * 1000);
    return expirationDate
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    deviceId: {
        type: String,
        default: ''
    },

    deviceBuildID: {
        type: String,
        default: ''
    },
    isLoginBlock: {
        type: Boolean,
        default: false
    },
    isDeviceReset: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    key: {
        type: String
    },
    expirationDate: {
        type: Date,
        default: getData(7)
    }
});

const UserModel = mongoose.connection.useDb("appVx").model("users", userSchema);

async function createUser(username, password) {
    try {
        const userExist = await UserModel.findOne({ username });

        if (!userExist) {
            const user = new UserModel({
                username,
                password
            });
            await user.save();

            return user;
        } else {
            console.log("O usuário já existe.");
            return false;
        }
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        throw error;
    }
}

async function resetLogin(username) {
    try {

        const userExist = await UserModel.findOne({ username });

        if (!userExist) {

            return false;
        }

        const isReset = await UserModel.updateOne(
            { username },
            { $set: { isDeviceReset: true } }
        );


        if (isReset) {
            const formattedDateLastLogin = userExist.lastLogin ? new Date(userExist.lastLogin).toLocaleString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

            const expirationDateFormatted = new Date(userExist.expirationDate).toLocaleString('pt-BR', { timeZone: 'UTC' });

            return `**Login resetado com sucesso:**\n\n` +
                `**Usuário:** ${userExist.username}\n` +
                `**Senha:** ${userExist.password}\n` +
                `**Vencimento do Login:** ${expirationDateFormatted}\n` +
                `**Último Login:** ${formattedDateLastLogin}\n` +
                `**Login Bloqueado:** ${userExist.isLoginBlock ? 'Sim' : 'Não'}\n` +
                `**Reset Login:** ${userExist.isDeviceReset ? 'Sim' : 'Não'}`;
        }

    } catch (err) {
        console.error('Erro ao bloquear o login:', err);
        return 'Erro interno no servidor.';
    }
}

async function getAllUsers() {
    try {
        const allUsers = await UserModel.find({});
        let formattedUsers = '';

        if (allUsers.length > 0) {
            allUsers.forEach(user => {
                const formattedDateLastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
                const expirationDateFormatted = new Date(user.expirationDate).toLocaleString('pt-BR', { timeZone: 'UTC' });

                formattedUsers += `**Usuário:** ${user.username}\n` +
                    `**Senha:** ${user.password}\n` +
                    `**Vencimento do Login:** ${expirationDateFormatted}\n` +
                    `**Último Login:** ${formattedDateLastLogin}\n` +
                    `**Login Bloqueado:** ${user.isLoginBlock ? 'Sim' : 'Não'}\n` +
                    `**Reset Login:** ${user.isDeviceReset ? 'Sim' : 'Não'}\n\n`;
            });

            return formattedUsers;
        } else {
            return `Nenhum usúario cadastrado.`
        }
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        throw error;
    }
}

async function blockLogin(username) {
    try {
        const userExist = await UserModel.findOne({ username });

        if (!userExist) {
            return false;
        }

        const isBlock = await UserModel.updateOne(
            { username },
            { $set: { isLoginBlock: true } }
        );


        if (isBlock) {
            const formattedDateLastLogin = userExist.lastLogin ? new Date(userExist.lastLogin).toLocaleString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

            const expirationDateFormatted = new Date(userExist.expirationDate).toLocaleString('pt-BR', { timeZone: 'UTC' });

            return `**Login bloqueado com sucesso:**\n\n` +
                `**Usuário:** ${userExist.username}\n` +
                `**Senha:** ${userExist.password}\n` +
                `**Vencimento do Login:** ${expirationDateFormatted}\n` +
                `**Último Login:** ${formattedDateLastLogin}\n` +
                `**Login Bloqueado:** ${userExist.isLoginBlock ? 'Sim' : 'Não'}\n` +
                `**Reset Login:** ${userExist.isDeviceReset ? 'Sim' : 'Não'}`;
        }
    } catch (err) {
        console.error('Erro ao bloquear o login:', err);
        return 'Erro interno no servidor.';
    }
}

module.exports = {
    UserModel,
    createUser,
    resetLogin,
    blockLogin,
    getAllUsers
};
