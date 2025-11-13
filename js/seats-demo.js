(function () {
  const root = document.getElementById('rows');

  // 고정 열 수 (CSS 변수와 맞춤)
  const LEFT_COLS = 9;
  const RIGHT_COLS = 6;

  // 각 행별 좌석 개수
  const totals = { A:30, B:30, C:24, D:30, E:24, F:14, G:18 };

  // 콘센트 있는 좌석
  const powerMap = {
    A:[1,16,15,30],
    B:[1,16],
    C:[12,24],
    D:[1,16],
    E:[12,24],
    F:[1,8,7,14],
    G:[1,10,9,18],
  };

  // 고스트(빈 자리) 오프셋
  const ghostOffsets = {
    A:{ lt:0, lb:0, rt:0, rb:0 },
    B:{ lt:0, lb:0, rt:0, rb:0 },
    C:{ lt:2, lb:2, rt:0, rb:0 },
    D:{ lt:0, lb:0, rt:0, rb:0 },
    E:{ lt:3, lb:3, rt:0, rb:0 },
    F:{ lt:3, lb:3, rt:0, rb:0 },
    G:{ lt:3, lb:3, rt:0, rb:0 },
  };

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

  const seatDataMap = loadSeatMap();

  const makeDiv = cls => {
    const d = document.createElement('div');
    d.className = cls;
    return d;
  };

  function makeSeat(rowKey, n, status, classes = []) {
    const s = makeDiv('seat ' + classes.join(' '));
    s.textContent = typeof n === 'number' ? n : '';
    if (rowKey && n) {
      const id = `${rowKey}${n}`;
      s.dataset.id = id;

      if (status === '사용 중') {
        s.classList.add('using');
      }

      if ((powerMap[rowKey] || []).includes(n)) {
        s.classList.add('power');
      }

      if (!classes.includes('ghost')) {
        s.addEventListener('click', () => {
          window.location.href = `seat.html?seat=${id}`;
        });
      }
    }
    return s;
  }

  function fillLine(lineEl, cols, arr, rowKey) {
    let count = 0;
    for (const item of arr) {
      if (count >= cols) break;
      if (item === 'ghost') {
        lineEl.appendChild(makeSeat('', '', '비어 있음', ['ghost']));
      } else {
        const id = `${rowKey}${item}`;
        const data = seatDataMap[id];
        const status = data && data.status ? data.status : '비어 있음';
        lineEl.appendChild(makeSeat(rowKey, item, status, []));
      }
      count++;
    }
    while (count < cols) {
      lineEl.appendChild(makeSeat('', '', '비어 있음', ['ghost']));
      count++;
    }
  }

  // 원래 seats.js와 동일한 분배 로직
  function splitNumbers(rowKey, total) {
    const map = {
      30:{L:9,R:6},
      24:{L:6,R:6},
      18:{L:6,R:3},
      14:{L:4,R:3}
    };
    const conf = map[total];
    const nums = Array.from({length:total}, (_,i)=>i+1);
    const topCount = conf.L + conf.R;
    const top = nums.slice(0, topCount);
    const bot = nums.slice(topCount);
    const lt = top.slice(0, conf.L);
    const rt = top.slice(conf.L);
    const lb = bot.slice(0, conf.L);
    const rb = bot.slice(conf.L);
    return { lt, rt, lb, rb };
  }

  function withGhosts(rowKey, lineKey, arr, targetCols) {
    const offset = (ghostOffsets[rowKey] || {})[lineKey] || 0;
    const res = [];
    for (let i = 0; i < offset; i++) res.push('ghost');
    for (const n of arr) res.push(n);
    return res.slice(0, targetCols);
  }

  function init() {
    const rowsOrder = ['A','B','C','D','E','F','G'];

    for (const rowKey of rowsOrder) {
      const row = makeDiv('row');

      const label = makeDiv('label');
      label.textContent = rowKey;
      row.appendChild(label);

      const leftBlock = makeDiv('block');
      const rightBlock = makeDiv('block');

      const L_top = makeDiv('line'); L_top.style.setProperty('--cols', LEFT_COLS);
      const L_bottom = makeDiv('line'); L_bottom.style.setProperty('--cols', LEFT_COLS);
      const R_top = makeDiv('line'); R_top.style.setProperty('--cols', RIGHT_COLS);
      const R_bottom = makeDiv('line'); R_bottom.style.setProperty('--cols', RIGHT_COLS);

      const { lt, rt, lb, rb } = splitNumbers(rowKey, totals[rowKey]);

      fillLine(L_top, LEFT_COLS, withGhosts(rowKey, 'lt', lt, LEFT_COLS), rowKey);
      fillLine(L_bottom, LEFT_COLS, withGhosts(rowKey, 'lb', lb, LEFT_COLS), rowKey);
      fillLine(R_top, RIGHT_COLS, withGhosts(rowKey, 'rt', rt, RIGHT_COLS), rowKey);
      fillLine(R_bottom, RIGHT_COLS, withGhosts(rowKey, 'rb', rb, RIGHT_COLS), rowKey);

      leftBlock.append(L_top, L_bottom);
      rightBlock.append(R_top, R_bottom);
      row.append(leftBlock, rightBlock);
      root.appendChild(row);
    }
  }

  init();
})();
