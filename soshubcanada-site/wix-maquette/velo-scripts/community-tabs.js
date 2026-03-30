// ===== ONGLETS COMMUNAUTÉS — Wix Velo =====
// Prérequis: Créer 4 boutons (#tabMaghreb, #tabAfrique, #tabLatino, #tabMena)
// et 4 containers (#contentMaghreb, #contentAfrique, #contentLatino, #contentMena)

$w.onReady(function () {
  const tabs = ['Maghreb', 'Afrique', 'Latino', 'Mena'];

  // Afficher Maghreb par défaut
  tabs.forEach(tab => {
    $w(`#content${tab}`).hide();
  });
  $w('#contentMaghreb').show();

  tabs.forEach(tab => {
    $w(`#tab${tab}`).onClick(() => {
      // Masquer tous les contenus
      tabs.forEach(t => {
        $w(`#content${t}`).hide();
        $w(`#tab${t}`).style.borderColor = '#e5e5e5';
        $w(`#tab${t}`).style.color = '#666666';
      });

      // Afficher le contenu sélectionné
      $w(`#content${tab}`).show('fade', { duration: 400 });
      $w(`#tab${tab}`).style.borderColor = '#C8A35F';
      $w(`#tab${tab}`).style.color = '#A8873F';
    });
  });
});
