// ===== COMPTEURS ANIMÉS — Wix Velo =====
// Ajouter ce code dans la page code de Wix Velo
// Prérequis: Ajouter des éléments texte avec les IDs: #counter1, #counter2, #counter3, #counter4

$w.onReady(function () {
  const counters = [
    { id: '#counter1', target: 500, suffix: '+', duration: 2000 },
    { id: '#counter2', target: 95, suffix: '%', duration: 2000 },
    { id: '#counter3', target: 50, suffix: '+', duration: 2000 },
    { id: '#counter4', target: 24, suffix: 'h', duration: 2000 },
  ];

  counters.forEach(counter => {
    const element = $w(counter.id);
    let current = 0;
    const increment = counter.target / (counter.duration / 30);

    const timer = setInterval(() => {
      current += increment;
      if (current >= counter.target) {
        current = counter.target;
        clearInterval(timer);
      }
      element.text = Math.floor(current) + counter.suffix;
    }, 30);
  });
});
