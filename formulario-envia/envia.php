<?php

// Passando os dados obtidos pelo formulário para as variáveis abaixo
$nomeremetente     = $_POST['nomeremetente'];
$emailremetente    = trim($_POST['emailremetente']);
$emaildestinatario = 'mfrlinux@gmail.com'; 
$telefone      	   = $_POST['telefone'];
$assunto          = $_POST['assunto'];
$outros          = $_POST['outros'];
$mensagem          = $_POST['mensagem'];
$data = date('d/m/Y - H:i:s');
$ip = $_SERVER['REMOTE_ADDR'];

 

/* Montando a mensagem a ser enviada no corpo do e-mail. */
$mensagemHTML = '<P>Entraram em contato -- MFR TELECOMUNICAÇÕES -- </P>
<p><b>Nome:</b> '.$nomeremetente.'
<p><b>E-Mail:</b> '.$emailremetente.'
<p><b>Telefone:</b> '.$telefone.'
<p><b>Assunto:</b> '.$assunto.'
<p><b>Mensagem:</b> '.$mensagem.'</p>
    <p><b>IP:</b> '.$ip.'</p>
        <p><b>Data:</b> '.$data.'</p>
<hr>';


// O remetente deve ser um e-mail do seu domínio conforme determina a RFC 822.
// O return-path deve ser ser o mesmo e-mail do remetente.
$headers = "MIME-Version: 1.1\r\n";
$headers .= "Content-type: text/html; charset=utf-8\r\n";
$headers .= "From: MFRTELECOM\r\n"; // remetente
$headers .= "Return-Path: $emaildestinatario \r\n"; // return-path

 
if (empty($nomeremetente) OR empty($emailremetente)) {
		 echo "<script>location.href='erro.html'</script>";
 } else {
     $envio = mail($emaildestinatario, $assunto, $mensagemHTML, $headers); 
 }
  
 if($envio) {
    echo "<script>location.href='sucesso.html'</script>"; // Página que será redirecionada
 }

?>
