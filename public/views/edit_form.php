<?php
session_start();
require_once '/etc/php_config/db_config.php';

$solicitacao = null;
$erro_busca = null;
$id_solicitacao = null;

if (isset($_GET['id'])) {
    $id_solicitacao = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    if ($id_solicitacao === false || $id_solicitacao <= 0) {
        $erro_busca = "ID da solicitação inválido.";
    } else {
        $pdo = null;
        try {
            $pdo = new PDO($dsn, $db_user, $db_pass, $options);
            $stmt = $pdo->prepare("SELECT * FROM solicitacoes_credito WHERE id = :id");
            $stmt->bindParam(':id', $id_solicitacao, PDO::PARAM_INT);
            $stmt->execute();
            $solicitacao = $stmt->fetch();

            if (!$solicitacao) {
                $erro_busca = "Solicitação com ID {$id_solicitacao} não encontrada.";
            } else {
                $solicitacao['socios_cpfs_array'] = $solicitacao['socios_cpfs'] ? json_decode($solicitacao['socios_cpfs'], true) : [];
                $solicitacao['empresas_cnpjs_array'] = $solicitacao['empresas_cnpjs'] ? json_decode($solicitacao['empresas_cnpjs'], true) : [];
                if (json_last_error() !== JSON_ERROR_NONE && !empty($solicitacao['socios_cpfs'])) {
                     error_log("JSON decode error for socios_cpfs, ID: {$id_solicitacao} - " . json_last_error_msg());
                }
                if (json_last_error() !== JSON_ERROR_NONE && !empty($solicitacao['empresas_cnpjs'])) {
                     error_log("JSON decode error for empresas_cnpjs, ID: {$id_solicitacao} - " . json_last_error_msg());
                }
            }
        } catch (PDOException $e) {
            error_log("Erro ao buscar solicitação ID {$id_solicitacao} para edição: " . $e->getMessage());
            $erro_busca = "Erro ao buscar dados da solicitação. Consulte o log.";
        }
    }
} else {
    $erro_busca = "Nenhum ID de solicitação fornecido para editar.";
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Solicitação ID: <?php echo htmlspecialchars($id_solicitacao ?? 'Inválido'); ?></title>
    <link rel="stylesheet" href="/css/styles.css"> <link rel="icon" type="image/png" href="/images/partnership_1.png"> </head>
<body>
<div class="form-container">
    <h1>Editar Solicitação ID: <?php echo htmlspecialchars($id_solicitacao ?? ''); ?></h1>

    <?php if (isset($_SESSION['mensagem_erro_update'])): ?>
        <div style='padding: 10px; margin-bottom: 15px; border: 1px solid red; background-color: #f8d7da; color: #721c24;'>
            <?php echo htmlspecialchars($_SESSION['mensagem_erro_update']); unset($_SESSION['mensagem_erro_update']); ?>
        </div>
    <?php endif; ?>

    <?php if ($erro_busca): ?>
        <p style="color: red; text-align: center;"><?php echo htmlspecialchars($erro_busca); ?></p>
        <p style="text-align: center;"><a href="/views/view.php">Voltar para a lista</a></p>
    <?php elseif ($solicitacao): ?>
        <form id="credito-form-edit" method="POST" action="/actions/update_script.php">
            <input type="hidden" name="id_solicitacao" value="<?php echo htmlspecialchars($solicitacao['id']); ?>">

            <fieldset>
                <legend>Dados de Quem Está Indicando</legend>
                <label for="indicador-nome">Nome Completo:</label>
                <input type="text" id="indicador-nome" name="indicador_nome" required value="<?php echo htmlspecialchars($solicitacao['indicador_nome']); ?>" />

                <label for="indicador-celular">Celular:</label>
                <input type="tel" id="indicador-celular" name="indicador_celular" required value="<?php echo htmlspecialchars($solicitacao['indicador_celular']); ?>" />
                <span class="erro" id="erro-indicador-celular"></span>

                <label for="empresa">Afiliação:</label>
                <select id="empresa" name="empresa" required>
                    <option value="">Selecione</option>
                    <option value="A" <?php echo ($solicitacao['empresa'] === 'A') ? 'selected' : ''; ?>>Agente de Rua</option>
                    <option value="B" <?php echo ($solicitacao['empresa'] === 'B') ? 'selected' : ''; ?>>Especialista em Contas</option>
                    <option value="C" <?php echo ($solicitacao['empresa'] === 'C') ? 'selected' : ''; ?>>Franqueador</option>
                </select>
            </fieldset>

            <fieldset>
                <legend>Dados do Cliente</legend>
                <label for="cnpj">CNPJ:</label>
                <input type="text" id="cnpj" name="cnpj" required value="<?php echo htmlspecialchars($solicitacao['cnpj']); ?>" />
                <span class="erro" id="erro-cnpj"></span>

                <div id="dados-empresa">
                    <label for="razao-social">Razão Social:</label>
                    <input type="text" id="razao-social" name="razao_social" value="<?php echo htmlspecialchars($solicitacao['razao_social'] ?? ''); ?>" />
                    <label for="nome-fantasia">Nome Fantasia:</label>
                    <input type="text" id="nome-fantasia" name="nome_fantasia" value="<?php echo htmlspecialchars($solicitacao['nome_fantasia'] ?? ''); ?>" />
                    <label for="uf">UF:</label>
                    <input type="text" id="uf" name="uf" value="<?php echo htmlspecialchars($solicitacao['uf'] ?? ''); ?>" />
                    <label for="municipio">Município:</label>
                    <input type="text" id="municipio" name="municipio" value="<?php echo htmlspecialchars($solicitacao['municipio'] ?? ''); ?>" />
                </div>

                <label for="nome-td">Nome do Tomador de Decisão:</label>
                <input type="text" id="nome-td" name="nome_td" required value="<?php echo htmlspecialchars($solicitacao['nome_td']); ?>" />
                <label for="celular-td">Celular do Tomador:</label>
                <input type="tel" id="celular-td" name="celular_td" required value="<?php echo htmlspecialchars($solicitacao['celular_td']); ?>" />
                <span class="erro" id="erro-celular-td"></span>
                <label for="email-td">Email do Tomador:</label>
                <input type="email" id="email-td" name="email_td" required value="<?php echo htmlspecialchars($solicitacao['email_td']); ?>" />
                <span class="erro" id="erro-email"></span>
                <label for="cpf-td">CPF do Tomador:</label>
                <input type="text" id="cpf-td" name="cpf_td" required value="<?php echo htmlspecialchars($solicitacao['cpf_td']); ?>" />
                <span class="erro" id="erro-cpf-td"></span>
            </fieldset>

            <fieldset>
                <legend>Quadro Societário</legend>
                <label>O cliente tem outros sócios (CPFs)?</label>
                <div>
                    <label><input type="radio" name="outros_socios" value="sim" required <?php echo ($solicitacao['outros_socios'] === 'sim') ? 'checked' : ''; ?> /> Sim</label>
                    <label><input type="radio" name="outros_socios" value="nao" <?php echo ($solicitacao['outros_socios'] === 'nao' || empty($solicitacao['outros_socios'])) ? 'checked' : ''; ?>/> Não</label>
                </div>
                <div id="socios-collapse" class="collapse <?php echo ($solicitacao['outros_socios'] !== 'sim') ? 'hidden' : ''; ?>">
                    <label>CPFs dos sócios:</label>
                    <div id="cpf-socios-container">
                        <?php if (is_array($solicitacao['socios_cpfs_array']) && !empty($solicitacao['socios_cpfs_array'])): ?>
                            <?php foreach($solicitacao['socios_cpfs_array'] as $cpfSocio): ?>
                                <div class="dynamic-input">
                                    <input type="text" name="cpf_socio[]" placeholder="CPF do Sócio" value="<?php echo htmlspecialchars($cpfSocio); ?>" data-mask="cpf">
                                    <button type="button" onclick="this.parentElement.remove()">–</button>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    <button type="button" id="add-cpf-socio-edit">+ Adicionar CPF</button>
                </div>
            </fieldset>

            <fieldset>
                <legend>Grupo Econômico</legend>
                <label>O cliente tem outras empresas (CNPJs)?</label>
                <div>
                    <label><input type="radio" name="outras_empresas" value="sim" required <?php echo ($solicitacao['outras_empresas'] === 'sim') ? 'checked' : ''; ?> /> Sim</label>
                    <label><input type="radio" name="outras_empresas" value="nao" <?php echo ($solicitacao['outras_empresas'] === 'nao' || empty($solicitacao['outras_empresas'])) ? 'checked' : ''; ?>/> Não</label>
                </div>
                <div id="empresas-collapse" class="collapse <?php echo ($solicitacao['outras_empresas'] !== 'sim') ? 'hidden' : ''; ?>">
                    <label>CNPJs das outras empresas:</label>
                    <div id="cnpj-empresas-container-edit">
                         <?php if (is_array($solicitacao['empresas_cnpjs_array']) && !empty($solicitacao['empresas_cnpjs_array'])): ?>
                            <?php foreach($solicitacao['empresas_cnpjs_array'] as $cnpjEmpresa): ?>
                                <div class="dynamic-input">
                                    <input type="text" name="cnpj_empresa[]" placeholder="CNPJ da Empresa" value="<?php echo htmlspecialchars($cnpjEmpresa); ?>" data-mask="cnpj">
                                    <button type="button" onclick="this.parentElement.remove()">–</button>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    <button type="button" id="add-cnpj-empresa-edit">+ Adicionar CNPJ</button>
                </div>
            </fieldset>

            <fieldset>
                <legend>Dados da Operação</legend>
                <label for="valor">Valor solicitado:</label>
                <input type="text" id="valor" name="valor" required value="R$ <?php echo number_format(floatval($solicitacao['valor']), 2, ',', '.'); ?>" />
                <span class="erro" id="erro-valor"></span>
                <label for="prazo">Prazo solicitado (meses):</label>
                <select id="prazo" name="prazo" required>
                    <option value="">Selecione</option>
                    <?php $prazos = [12, 18, 24, 30, 36, 42, 48]; ?>
                    <?php foreach ($prazos as $p): ?>
                        <option value="<?php echo $p; ?>" <?php echo ($solicitacao['prazo'] == $p) ? 'selected' : ''; ?>><?php echo $p; ?></option>
                    <?php endforeach; ?>
                </select>
                <label for="parecer">Parecer comercial:</label>
                <textarea id="parecer" name="parecer" rows="4" required><?php echo htmlspecialchars($solicitacao['parecer']); ?></textarea>
                <label for="finalidade">Finalidade do recurso:</label>
                <textarea id="finalidade" name="finalidade" rows="3" required><?php echo htmlspecialchars($solicitacao['finalidade']); ?></textarea>
            </fieldset>

            <div class="form-footer">
                <button type="submit">Atualizar Solicitação</button>
                <a href="/views/view.php" style="margin-left: 10px; text-decoration:none; padding: 0.7rem 1.2rem; background-color: #ccc; color: #333; border-radius: 8px;">Cancelar</a>
            </div>
        </form>
    <?php else: ?>
        <p style="text-align: center;">Não foi possível carregar os dados da solicitação.</p>
        <p style="text-align: center;"><a href="/views/view.php">Voltar para a lista</a></p>
    <?php endif; ?>
</div>

<script src="/scripts/script.js"></script> 
</body>
</html>