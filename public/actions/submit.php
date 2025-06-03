<?php
session_start();
require_once '/etc/php_config/db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $indicador_nome = isset($_POST['indicador_nome']) ? trim($_POST['indicador_nome']) : '';
    $indicador_celular_mascarado = isset($_POST['indicador_celular']) ? trim($_POST['indicador_celular']) : '';
    $empresa_valor_post = isset($_POST['empresa']) ? trim($_POST['empresa']) : '';
    $cnpj_mascarado = isset($_POST['cnpj']) ? trim($_POST['cnpj']) : '';
    
    $razao_social = isset($_POST['razao_social']) ? trim($_POST['razao_social']) : null;
    $nome_fantasia = isset($_POST['nome_fantasia']) ? trim($_POST['nome_fantasia']) : null;
    $uf = isset($_POST['uf']) ? trim($_POST['uf']) : null;
    $municipio = isset($_POST['municipio']) ? trim($_POST['municipio']) : null;

    $nome_td = isset($_POST['nome_td']) ? trim($_POST['nome_td']) : '';
    $celular_td_mascarado = isset($_POST['celular_td']) ? trim($_POST['celular_td']) : '';
    $email_td = isset($_POST['email_td']) ? trim($_POST['email_td']) : '';
    $cpf_td_mascarado = isset($_POST['cpf_td']) ? trim($_POST['cpf_td']) : '';
    $outros_socios = isset($_POST['outros_socios']) ? trim($_POST['outros_socios']) : 'nao';

    $socios_cpfs_array_limpo = [];
    if ($outros_socios === 'sim' && isset($_POST['cpf_socio']) && is_array($_POST['cpf_socio'])) {
        foreach ($_POST['cpf_socio'] as $cpf_socio_item) {
            $cpf_limpo = preg_replace('/\D/', '', trim($cpf_socio_item));
            if (!empty($cpf_limpo)) { $socios_cpfs_array_limpo[] = $cpf_limpo; }
        }
    }
    $socios_cpfs_json_final = $outros_socios === 'sim' ? json_encode($socios_cpfs_array_limpo) : null;

    $outras_empresas = isset($_POST['outras_empresas']) ? trim($_POST['outras_empresas']) : 'nao';
    $empresas_cnpjs_array_limpo = [];
    if ($outras_empresas === 'sim' && isset($_POST['cnpj_empresa']) && is_array($_POST['cnpj_empresa'])) {
        foreach ($_POST['cnpj_empresa'] as $cnpj_empresa_item) {
            $cnpj_limpo = preg_replace('/\D/', '', trim($cnpj_empresa_item));
            if (!empty($cnpj_limpo)) { $empresas_cnpjs_array_limpo[] = $cnpj_limpo; }
        }
    }
    $empresas_cnpjs_json_final = $outras_empresas === 'sim' ? json_encode($empresas_cnpjs_array_limpo) : null;

    $valor_mascarado = isset($_POST['valor']) ? trim($_POST['valor']) : '';
    $prazo_valor_post = isset($_POST['prazo']) ? filter_var($_POST['prazo'], FILTER_VALIDATE_INT) : null;
    $parecer_valor_post = isset($_POST['parecer']) ? trim($_POST['parecer']) : '';
    $finalidade_valor_post = isset($_POST['finalidade']) ? trim($_POST['finalidade']) : '';

    $indicador_celular_limpo = preg_replace('/\D/', '', $indicador_celular_mascarado);
    $celular_td_limpo = preg_replace('/\D/', '', $celular_td_mascarado);
    $cnpj_limpo = preg_replace('/\D/', '', $cnpj_mascarado);
    $cpf_td_limpo = preg_replace('/\D/', '', $cpf_td_mascarado);
    $valor_temp = str_replace('R$ ', '', $valor_mascarado);
    $valor_temp = str_replace('.', '', $valor_temp);
    $valor_limpo_final = str_replace(',', '.', $valor_temp);

    $pdo = null;
    try {
        $pdo = new PDO($dsn, $db_user, $db_pass, $options);
        $sql = "INSERT INTO solicitacoes_credito (
                    indicador_nome, indicador_celular, empresa, cnpj, razao_social, nome_fantasia, uf, municipio,
                    nome_td, celular_td, email_td, cpf_td,
                    outros_socios, socios_cpfs, outras_empresas, empresas_cnpjs,
                    valor, prazo, parecer, finalidade
                ) VALUES (
                    :indicador_nome, :indicador_celular, :empresa, :cnpj, :razao_social, :nome_fantasia, :uf, :municipio,
                    :nome_td, :celular_td, :email_td, :cpf_td,
                    :outros_socios, :socios_cpfs, :outras_empresas, :empresas_cnpjs,
                    :valor, :prazo, :parecer, :finalidade
                )";
        $stmt = $pdo->prepare($sql);

        $stmt->bindParam(':indicador_nome', $indicador_nome);
        $stmt->bindParam(':indicador_celular', $indicador_celular_limpo);
        $stmt->bindParam(':empresa', $empresa_valor_post);
        $stmt->bindParam(':cnpj', $cnpj_limpo);
        $stmt->bindParam(':razao_social', $razao_social);
        $stmt->bindParam(':nome_fantasia', $nome_fantasia);
        $stmt->bindParam(':uf', $uf);
        $stmt->bindParam(':municipio', $municipio);
        $stmt->bindParam(':nome_td', $nome_td);
        $stmt->bindParam(':celular_td', $celular_td_limpo);
        $stmt->bindParam(':email_td', $email_td);
        $stmt->bindParam(':cpf_td', $cpf_td_limpo);
        $stmt->bindParam(':outros_socios', $outros_socios);
        $stmt->bindParam(':socios_cpfs', $socios_cpfs_json_final);
        $stmt->bindParam(':outras_empresas', $outras_empresas);
        $stmt->bindParam(':empresas_cnpjs', $empresas_cnpjs_json_final);
        $stmt->bindParam(':valor', $valor_limpo_final);
        $stmt->bindParam(':prazo', $prazo_valor_post, PDO::PARAM_INT);
        $stmt->bindParam(':parecer', $parecer_valor_post);
        $stmt->bindParam(':finalidade', $finalidade_valor_post);

        $stmt->execute();
        $_SESSION['mensagem_sucesso'] = "Nova solicitação enviada com sucesso!";
    } catch (PDOException $e) {
        error_log("Erro ao inserir solicitação: " . $e->getMessage());
        $_SESSION['mensagem_erro'] = "Erro ao enviar solicitação. Detalhe (DEV): " . $e->getMessage();
    }
    header("Location: /views/view.php");
    exit;
} else {
    $_SESSION['mensagem_erro'] = "Acesso inválido ao script de submissão.";
    header("Location: /index.html");
    exit;
}
?>