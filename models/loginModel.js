const odbc = require('odbc');

const validateLogin = async (user, password) => {
    const connectionString = `DSN=${process.env.ODBC_DSN};UID=${user};PWD=${password};CCSID=1208`;

    try {
        const connection = await odbc.connect(connectionString);
        await connection.close(); // Opcional: cierra después de validar
        return true; // Login exitoso
    } catch (error) {
        console.error('Login fallido:', error.message);
        return false; // Login fallido
    }
};

module.exports = {
    validateLogin
};
