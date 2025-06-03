<?php
session_start();
require_once '/etc/php_config/db_config.php'; // Usando o caminho mapeado

if (isset($_GET['id'])) {
    $id_solicitacao = filter_var($_GET['id'], FILTER_VALIDATE_INT);

    if ($id_solicitacao === false || $id_solicitacao <= 0) {
        $_SESSION['mensagem_erro'] = "ID da solicitação inválido para deleção.";
        header("Location: /views/view.php"); // Caminho absoluto
        exit;
    }

    $pdo = null;
    try {
        $pdo = new PDO($dsn, $db_user, $db_pass, $options);
        $sql = "DELETE FROM solicitacoes_credito WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id_solicitacao, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $_SESSION['mensagem_sucesso'] = "Solicitação ID {$id_solicitacao} deletada com sucesso!";
        } else {
            $_SESSION['mensagem_erro'] = "Solicitação ID {$id_solicitacao} não encontrada ou já havia sido deletada.";
        }
    } catch (PDOException $e) {
        error_log("Erro ao deletar solicitação ID {$id_solicitacao}: " . $e->getMessage());
        $_SESSION['mensagem_erro'] = "Erro ao deletar a solicitação. Consulte o log para mais detalhes.";
    }
} else {
    $_SESSION['mensagem_erro'] = "Nenhum ID de solicitação fornecido para deletar.";
}

header("Location: /views/view.php"); // Caminho absoluto
exit;
?>