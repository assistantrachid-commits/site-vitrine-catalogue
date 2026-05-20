<?php
/* ────────────────────────────────────────────────
   CONFIGURATION — à modifier avant mise en ligne
   ──────────────────────────────────────────────── */
define('DEST_EMAIL',    'rachid.imechoui78@gmail.com'); // ← votre email de réception
define('FROM_EMAIL',    'noreply@rachid.fr');           // ← email expéditeur (domaine Hostinger)
define('SUBJECT_PREFIX','[Nouvelle demande] ');

/* ────────────────────────────────────────────────
   SÉCURITÉ
   ──────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Méthode non autorisée.');
}

/* Vérification RGPD */
if (empty($_POST['rgpd'])) {
    http_response_code(400);
    exit('Consentement RGPD manquant.');
}

/* Fonction de nettoyage */
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val ?? '')), ENT_QUOTES, 'UTF-8');
}

/* ────────────────────────────────────────────────
   RÉCUPÉRATION DES CHAMPS
   ──────────────────────────────────────────────── */
$prenom      = clean($_POST['prenom']      ?? '');
$nom         = clean($_POST['nom']         ?? '');
$email       = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telephone   = clean($_POST['telephone']   ?? '');
$whatsapp    = clean($_POST['whatsapp']    ?? '');
$adresse     = clean($_POST['adresse']     ?? '');
$profil      = clean($_POST['profil']      ?? '');
$pays        = clean($_POST['pays']        ?? '');
$ville       = clean($_POST['ville']       ?? '');
$description = clean($_POST['description'] ?? '');
$quantite    = clean($_POST['quantite']    ?? '');
$delai       = clean($_POST['delai']       ?? '');
$budget      = clean($_POST['budget']      ?? '');
$source      = clean($_POST['source']      ?? '');

/* Validation champs obligatoires */
if (!$prenom || !$nom || !$email || !$telephone || !$profil || !$pays || !$ville || !$description || !$quantite || !$delai) {
    http_response_code(400);
    exit('Champs obligatoires manquants.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit('Adresse email invalide.');
}

/* ────────────────────────────────────────────────
   CONSTRUCTION DU MESSAGE HTML
   ──────────────────────────────────────────────── */
$date = date('d/m/Y à H:i');

$html = "
<!DOCTYPE html>
<html lang='fr'>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrap { max-width: 600px; margin: 32px auto; background: #ffffff; }
    .header { background: #0a0a0a; padding: 32px 40px; }
    .header-logo { font-size: 22px; color: #ffffff; letter-spacing: 0.02em; }
    .header-logo span { color: #C9A96E; }
    .header-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 6px; letter-spacing: 0.12em; text-transform: uppercase; }
    .body { padding: 36px 40px; }
    .section { margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid #f0f0f0; }
    .section:last-child { border-bottom: none; margin-bottom: 0; }
    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A96E; margin-bottom: 14px; }
    .row { display: flex; margin-bottom: 8px; }
    .label { font-size: 12px; color: #999; min-width: 160px; flex-shrink: 0; }
    .value { font-size: 13px; color: #222; font-weight: 500; }
    .desc-block { background: #f9f9f9; border-left: 3px solid #C9A96E; padding: 16px 20px; font-size: 13px; color: #333; line-height: 1.7; white-space: pre-wrap; }
    .badge { display: inline-block; background: #0a0a0a; color: #C9A96E; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 10px; margin-top: 4px; }
    .footer { background: #f9f9f9; padding: 20px 40px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; }
  </style>
</head>
<body>
<div class='wrap'>
  <div class='header'>
    <div class='header-logo'>Rachid<span>·</span></div>
    <div class='header-sub'>Nouvelle demande reçue le {$date}</div>
  </div>
  <div class='body'>

    <div class='section'>
      <div class='section-title'>Coordonnées</div>
      <div class='row'><span class='label'>Nom complet</span><span class='value'>{$prenom} {$nom}</span></div>
      <div class='row'><span class='label'>Email</span><span class='value'><a href='mailto:{$email}'>{$email}</a></span></div>
      <div class='row'><span class='label'>Téléphone</span><span class='value'>{$telephone}</span></div>";

if ($whatsapp) $html .= "<div class='row'><span class='label'>WhatsApp</span><span class='value'>{$whatsapp}</span></div>";
if ($adresse)  $html .= "<div class='row'><span class='label'>Adresse</span><span class='value'>{$adresse}</span></div>";

$html .= "
    </div>

    <div class='section'>
      <div class='section-title'>Profil &amp; livraison</div>
      <div class='row'><span class='label'>Profil</span><span class='value'><span class='badge'>{$profil}</span></span></div>
      <div class='row'><span class='label'>Pays de livraison</span><span class='value'>{$pays}</span></div>
      <div class='row'><span class='label'>Ville</span><span class='value'>{$ville}</span></div>
    </div>

    <div class='section'>
      <div class='section-title'>Le produit</div>
      <div style='margin-bottom:16px;'>
        <div style='font-size:11px;color:#999;margin-bottom:8px;letter-spacing:0.1em;text-transform:uppercase;'>Description</div>
        <div class='desc-block'>{$description}</div>
      </div>
      <div class='row'><span class='label'>Quantité</span><span class='value'>{$quantite}</span></div>
      <div class='row'><span class='label'>Délai souhaité</span><span class='value'>{$delai}</span></div>";

if ($budget) $html .= "<div class='row'><span class='label'>Budget indicatif</span><span class='value'>{$budget}</span></div>";

$html .= "
    </div>";

if ($source) {
    $html .= "
    <div class='section'>
      <div class='section-title'>Source</div>
      <div class='row'><span class='label'>Connu via</span><span class='value'>{$source}</span></div>
    </div>";
}

$html .= "
  </div>
  <div class='footer'>
    Demande envoyée depuis rachid.fr · {$date}<br>
    Répondre directement à : <a href='mailto:{$email}'>{$email}</a>
  </div>
</div>
</body>
</html>";

/* ────────────────────────────────────────────────
   GESTION DES PIÈCES JOINTES
   ──────────────────────────────────────────────── */
$attachments = [];
$maxSize     = 10 * 1024 * 1024; // 10 Mo par fichier
$allowedTypes = ['image/jpeg','image/png','image/gif','image/webp','application/pdf',
                 'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

if (!empty($_FILES['fichiers']['name'][0])) {
    $count = count($_FILES['fichiers']['name']);
    for ($i = 0; $i < $count; $i++) {
        if ($_FILES['fichiers']['error'][$i] !== UPLOAD_ERR_OK) continue;
        if ($_FILES['fichiers']['size'][$i] > $maxSize) continue;

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($_FILES['fichiers']['tmp_name'][$i]);
        if (!in_array($mime, $allowedTypes)) continue;

        $attachments[] = [
            'name' => basename($_FILES['fichiers']['name'][$i]),
            'mime' => $mime,
            'data' => file_get_contents($_FILES['fichiers']['tmp_name'][$i]),
        ];
    }
}

/* ────────────────────────────────────────────────
   CONSTRUCTION DE L'EMAIL MULTIPART
   ──────────────────────────────────────────────── */
$boundary      = '----=_Part_' . md5(uniqid());
$boundaryAlt   = '----=_Alt_'  . md5(uniqid());

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";
$headers .= "From: Rachid· <" . FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: {$prenom} {$nom} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$subject = SUBJECT_PREFIX . "{$prenom} {$nom} — {$profil} — {$pays}";

$body  = "--{$boundary}\r\n";
$body .= "Content-Type: multipart/alternative; boundary=\"{$boundaryAlt}\"\r\n\r\n";

/* Version texte brut */
$textBody  = "NOUVELLE DEMANDE — {$date}\n\n";
$textBody .= "NOM : {$prenom} {$nom}\n";
$textBody .= "EMAIL : {$email}\n";
$textBody .= "TEL : {$telephone}\n";
if ($whatsapp) $textBody .= "WHATSAPP : {$whatsapp}\n";
$textBody .= "PROFIL : {$profil}\n";
$textBody .= "PAYS : {$pays} — VILLE : {$ville}\n\n";
$textBody .= "DESCRIPTION :\n{$description}\n\n";
$textBody .= "QUANTITE : {$quantite}\n";
$textBody .= "DELAI : {$delai}\n";
if ($budget) $textBody .= "BUDGET : {$budget}\n";
if ($source) $textBody .= "SOURCE : {$source}\n";

$body .= "--{$boundaryAlt}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
$body .= quoted_printable_encode($textBody) . "\r\n";

$body .= "--{$boundaryAlt}\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
$body .= quoted_printable_encode($html) . "\r\n";

$body .= "--{$boundaryAlt}--\r\n";

/* Pièces jointes */
foreach ($attachments as $att) {
    $encoded = chunk_split(base64_encode($att['data']));
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: {$att['mime']}; name=\"{$att['name']}\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"{$att['name']}\"\r\n\r\n";
    $body .= $encoded . "\r\n";
}

$body .= "--{$boundary}--";

/* ────────────────────────────────────────────────
   ENVOI
   ──────────────────────────────────────────────── */
$sent = mail(DEST_EMAIL, $subject, $body, $headers);

if ($sent) {
    http_response_code(200);
    echo 'ok';
} else {
    http_response_code(500);
    echo 'error';
}
