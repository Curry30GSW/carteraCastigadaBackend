const pool = require('../config/mysqlConnection');

async function registrarAuditoria(usuario, ip, accion) {
    const query = `INSERT INTO auditoria (usuario, ip, evento, fecha) VALUES (?, ?, ?, NOW())`;
    await pool.execute(query, [usuario, ip, accion]);
}

module.exports = {
    registrarAuditoria
};
