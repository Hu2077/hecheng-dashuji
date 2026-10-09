/* 合成大书记：仅保存在当前浏览器的最近 20 局排行榜。 */
(function () {
  'use strict';
  const NAME_KEY = 'dashuji.name.v1';
  const BOARD_KEY = 'dashuji.board.v1';
  const $ = id => document.getElementById(id);
  const cleanName = value => String(value || '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 12) || '默认用户';
  let rows = [];
  let nickname = '默认用户';
  let pending = null;
  let latestId = null;
  try {
    nickname = cleanName(localStorage.getItem(NAME_KEY));
    const stored = JSON.parse(localStorage.getItem(BOARD_KEY) || '[]');
    if (Array.isArray(stored)) rows = stored.filter(row => row && Number.isFinite(row.score) && row.score >= 0 && Number.isFinite(row.time) && typeof row.id === 'string')
      .map(row => ({ ...row, name: cleanName(row.name) })).slice(-20);
  } catch (_) { /* 损坏的本机榜单不影响游戏。 */ }

  function paintName() {
    $('nickInput').value = nickname;
    $('myNameLabel').textContent = nickname;
  }
  function saveName() {
    nickname = cleanName($('nickInput').value);
    try { localStorage.setItem(NAME_KEY, nickname); } catch (_) { /* 本次会话仍可使用昵称。 */ }
    paintName();
  }
  function renderBoard() {
    const list = $('boardList');
    list.textContent = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'board-msg';
      empty.textContent = '还没有成绩，先来一局吧！';
      list.appendChild(empty);
      return;
    }
    rows.slice().sort((a, b) => b.score - a.score || b.time - a.time).forEach((row, i) => {
      const line = document.createElement('div');
      line.className = 'board-row' + (i < 3 ? ' r' + (i + 1) : '') + (row.id === latestId ? ' is-mine' : '');
      const fields = [['board-rank', i < 3 ? ['🥇','🥈','🥉'][i] : String(i + 1)], ['board-name', row.name], ['board-score', String(row.score)]];
      for (const [className, text] of fields) {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        line.appendChild(span);
      }
      list.appendChild(line);
    });
  }
  function openBoard() {
    renderBoard();
    $('boardModal').classList.add('show');
    $('boardModal').setAttribute('aria-hidden', 'false');
  }
  function closeBoard() {
    saveName();
    $('boardModal').classList.remove('show');
    $('boardModal').setAttribute('aria-hidden', 'true');
  }
  function savePending() {
    if (!pending) return;
    const next = rows.concat(pending).slice(-20);
    try {
      localStorage.setItem(BOARD_KEY, JSON.stringify(next));
      rows = next;
      latestId = pending.id;
      pending = null;
      $('submitMsg').textContent = '本局成绩已保存到本机排行榜';
      $('submitMsg').className = 'submit-msg is-ok';
      $('submitBtn').hidden = true;
      renderBoard();
    } catch (_) {
      $('submitMsg').textContent = '浏览器暂时无法保存成绩，可重试保存';
      $('submitMsg').className = 'submit-msg is-error';
      $('submitBtn').hidden = false;
    }
  }
  function onGameOver(score) {
    if (!Number.isFinite(score) || score < 0) return;
    pending = { id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2), name: nickname, score, time: Date.now() };
    paintName();
    savePending();
  }
  function bind() {
    paintName();
    for (const id of ['boardBtn','boardBtn2']) $(id).addEventListener('click', openBoard);
    $('boardClose').addEventListener('click', closeBoard);
    $('boardRefresh').addEventListener('click', renderBoard);
    $('submitBtn').addEventListener('click', savePending);
    $('boardModal').addEventListener('click', e => { if (e.target === $('boardModal')) closeBoard(); });
    $('editNameBtn').addEventListener('click', () => { openBoard(); $('nickInput').focus(); $('nickInput').select(); });
    for (const event of ['change','blur']) $('nickInput').addEventListener(event, saveName);
    $('nickInput').addEventListener('keydown', e => { if (e.key === 'Enter') { saveName(); e.target.blur(); } });
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeBoard(); });
  }
  window.DashujiBoard = { onGameOver, open: openBoard, close: closeBoard };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
