(function () {
  const STORAGE_KEY = 'study_demo_seats';

  function loadSeatMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function saveSeatMap(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  function getSeatData(id) {
    const map = loadSeatMap();
    return map[id] || null;
  }

  function setSeatData(id, status, time) {
    const map = loadSeatMap();
    map[id] = { status, time };
    saveSeatMap(map);
  }

  const params = new URLSearchParams(window.location.search);
  const seatId = params.get('seat');  // 예: A6

  const seatIdEl   = document.getElementById('seat-id');
  const statusEl   = document.getElementById('status-text');
  const timeEl     = document.getElementById('timestamp');
  const actionBtn  = document.getElementById('action-btn');
  const seatImg    = document.getElementById('seat-img');

  if (!seatId) {
    alert('좌석 정보가 없습니다.');
    window.location.href = 'index.html';
    return;
  }
  seatIdEl.textContent = seatId;

  const usedImages = [
    'assets/img/desk_male.png',
    'assets/img/desk_female.png'
  ];

  function renderSeat(data) {
    const status = data && data.status ? data.status : '비어 있음';
    const time   = data && data.time   ? data.time   : '';

    statusEl.textContent = status;
    statusEl.className = 'info-value ' +
      (status === '사용 중' ? 'status-using' : 'status-empty');

    timeEl.textContent = time;

    if (status === '사용 중') {
      actionBtn.textContent = '퇴실';
      actionBtn.classList.add('btn-exit');
      const img = usedImages[Math.floor(Math.random() * usedImages.length)];
      seatImg.src = img;
    } else {
      actionBtn.textContent = '입실';
      actionBtn.classList.remove('btn-exit');
      seatImg.src = 'assets/img/desk_empty.png';
    }
  }

  function formatNow() {
    const now = new Date();
    return now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  actionBtn.addEventListener('click', () => {
    const current = statusEl.textContent.trim();
    let nextStatus, time;

    if (current === '비어 있음') {
      nextStatus = '사용 중';
      time = formatNow();   // 입실 시간
    } else {
      nextStatus = '비어 있음';
      time = formatNow();   // 퇴실 시간 (그냥 현재 시간 표시)
    }

    setSeatData(seatId, nextStatus, time);
    const data = getSeatData(seatId);
    renderSeat(data);
  });

  // 초기 렌더링
  renderSeat(getSeatData(seatId));
})();
