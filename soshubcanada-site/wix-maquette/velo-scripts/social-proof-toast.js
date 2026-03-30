// ===== SOCIAL PROOF TOAST — Wix Velo =====
// Prérequis: Créer un lightbox ou container caché avec:
//   #toastContainer (Box), #toastAvatar (Image), #toastText (Text), #toastTime (Text)

const toastData = [
  { name: 'Amina', country: '🇲🇦 Maroc', action: 'vient de recevoir son autorisation!', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face', time: 'Il y a 3 minutes' },
  { name: 'Karim', country: '🇩🇿 Algérie', action: 'a commencé son évaluation gratuite', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', time: 'Il y a 7 minutes' },
  { name: 'Fatou', country: '🇸🇳 Sénégal', action: 'a rejoint son mari à Montréal!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face', time: 'Il y a 12 minutes' },
  { name: 'Carlos', country: '🇨🇴 Colombie', action: 'a obtenu son emploi au Canada!', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', time: 'Il y a 18 minutes' },
  { name: 'Nadia', country: '🇹🇳 Tunisie', action: 'a commencé ses études à Montréal', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face', time: 'Il y a 25 minutes' },
  { name: 'Hassan', country: '🇱🇧 Liban', action: 'vient de compléter son évaluation', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', time: 'Il y a 31 minutes' },
];

let toastIndex = 0;

$w.onReady(function () {
  const container = $w('#toastContainer');
  container.hide();

  function showToast() {
    const data = toastData[toastIndex % toastData.length];
    $w('#toastAvatar').src = data.avatar;
    $w('#toastText').text = `${data.name} ${data.country} ${data.action}`;
    $w('#toastTime').text = data.time;

    container.show('slide', { duration: 500, direction: 'left' });

    setTimeout(() => {
      container.hide('slide', { duration: 500, direction: 'left' });
    }, 5000);

    toastIndex++;
  }

  // Premier toast après 8 secondes, puis toutes les 30 secondes
  setTimeout(() => {
    showToast();
    setInterval(showToast, 30000);
  }, 8000);
});
