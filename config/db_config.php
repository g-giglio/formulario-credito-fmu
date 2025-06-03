<?php
// db_config.php
// Detalhes da Conexão com o Banco de Dados AWS RDS
$db_host = 'database-tcc.cfmi40qw0fol.us-east-1.rds.amazonaws.com';
$db_name = 'formulario_credito';
$db_user = 'admin';
$db_pass = 'databasetccpss'; // Lembre-se de proteger esta senha em produção!
$db_charset = 'utf8mb4';

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Habilitar exibição de erros para depuração (remova ou ajuste para produção)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>