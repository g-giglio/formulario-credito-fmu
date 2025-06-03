<?php
session_start();
require_once '/etc/php_config/db_config.php';

$solicitacoes = [];
$pdo = null;
$db_erro_mensagem = null;

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    $stmt = $pdo->query("SELECT id, indicador_nome, cnpj, nome_td, valor, prazo, DATE_FORMAT(data_solicitacao, '%d/%m/%Y %H:%i') as data_formatada FROM solicitacoes_credito ORDER BY id DESC");
    $solicitacoes = $stmt->fetchAll();
} catch (PDOException $e) {
    $db_erro_mensagem = "Erro ao conectar ou buscar dados: " . $e->getMessage();
    error_log("Erro em view.php - PDOException: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualizar Solicitações</title>
    <link rel="stylesheet" href="/css/styles.css"> <link rel="icon" type="image/png" href="/images/partnership_1.png"> <style>
        /* Seus estilos para tabela, mensagens, etc. */
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: var(--azul); color: var(--branco); }
        .actions a { margin-right: 10px; }
        .container { max-width: 1100px; margin: 2rem auto; padding: 2rem; background-color: var(--branco); border-radius:12px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: var(--azul); text-align: center; margin-bottom: 1.5rem; }
        .mensagem { padding: 10px; margin-bottom: 15px; border: 1px solid; border-radius: 5px;}
        .mensagem.sucesso { border-color: green; background-color: #d4edda; color: #155724; }
        .mensagem.erro { border-color: red; background-color: #f8d7da; color: #721c24; }
        .button-container { text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Solicitações de Crédito</h1>

        <?php if (isset($_SESSION['mensagem_sucesso'])): ?>
            <div class="mensagem sucesso"><?php echo htmlspecialchars($_SESSION['mensagem_sucesso']); unset($_SESSION['mensagem_sucesso']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['mensagem_erro'])): ?>
            <div class="mensagem erro"><?php echo htmlspecialchars($_SESSION['mensagem_erro']); unset($_SESSION['mensagem_erro']); ?></div>
        <?php endif; ?>
        <?php if ($db_erro_mensagem): ?>
            <div class="mensagem erro"><?php echo htmlspecialchars($db_erro_mensagem); ?></div>
        <?php endif; ?>

        <?php if (empty($solicitacoes) && !$db_erro_mensagem): ?>
            <p>Nenhuma solicitação encontrada.</p>
        <?php elseif (!empty($solicitacoes)): ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Indicador</th><th>CNPJ</th><th>Tomador</th><th>Valor</th><th>Prazo</th><th>Data</th><th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($solicitacoes as $s): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($s['id']); ?></td>
                        <td><?php echo htmlspecialchars($s['indicador_nome']); ?></td>
                        <td><?php 
                            $cnpjFormatado = $s['cnpj'];
                            if (strlen($cnpjFormatado) == 14) {
                                $cnpjFormatado = preg_replace("/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/", "\$1.\$2.\$3/\$4-\$5", $cnpjFormatado);
                            }
                            echo htmlspecialchars($cnpjFormatado); 
                        ?></td>
                        <td><?php echo htmlspecialchars($s['nome_td']); ?></td>
                        <td>R$ <?php echo number_format(floatval($s['valor']), 2, ',', '.'); ?></td>
                        <td><?php echo htmlspecialchars($s['prazo']); ?></td>
                        <td><?php echo htmlspecialchars($s['data_formatada']); ?></td>
                        <td class="actions">
                            <a href="/views/edit_form.php?id=<?php echo $s['id']; ?>">✏️ Editar</a>
                            <a href="/actions/delete_script.php?id=<?php echo $s['id']; ?>" class="delete" onclick="return confirm('Tem certeza que deseja deletar esta solicitação? ID: <?php echo $s['id']; ?>');">🗑️ Deletar</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
        <div class="button-container">
            <a href="/index.html" class="button">Nova Solicitação</a>
        </div>
    </div>
</body>
</html>