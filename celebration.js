/* 合成指定人物时，全屏恭喜。预览与正常游戏共用同一个效果。 */
(function () {
  'use strict';
  const messages = {
    4: '合成书记：厉sir！',
    3: '合成书记，马sir！',
    2: '合成书记，龚sir！',
    1: '恭喜合成大书记：竹sir！',
    0: '恭喜合成大书记：杨sir！',
    '-1': '恭喜合成大书记：鲁sir！',
    '-2': '恭喜合成大书记：竹sir！'
  };
  const root = document.getElementById('celebration');
  const title = document.getElementById('celebrationTitle');
  const kicker = document.getElementById('celebrationKicker');
  const portrait = document.getElementById('celebrationPortrait');
  const caption = document.getElementById('celebrationCaption');
  const confetti = document.getElementById('celebrationConfetti');
  const colors = ['#ff637f','#ffc83d','#51c7e8','#a07dff','#fff4b3','#6bdca1'];
  let timer = null;
  let dismissedPointer = null;
  let suppressClick = false;

  function clear() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    root.hidden = true;
    root.classList.remove('is-celebrating', 'is-final', 'is-preview', 'is-clearing', 'is-achievement');
    confetti.textContent = '';
  }
  function show(number, options = {}) {
    const isClear = !!options.clearBonus;
    const isAchievement = !!options.achievement;
    if (!isClear && !Object.prototype.hasOwnProperty.call(messages, number)) return false;
    const isFinal = Number(number) === 1;
    clear();
    if (kicker) kicker.textContent = isAchievement ? '成 就 解 锁' : (isClear ? '清 屏 时 刻' : '恭 喜 合 成');
    title.textContent = isAchievement ? '达成成就：马嘉妮' : (messages[number] || '清屏奖励 +' + options.clearBonus);
    portrait.src = 'assets/characters/person-' + number + '.webp';
    portrait.alt = messages[number] || number + '号隐藏人物';
    caption.textContent = isAchievement ? '2、3、4 号同场登场！' : (isClear ? '清屏奖励 +' + options.clearBonus + ' 分 · 继续挑战！' : (isFinal ? '大书记登场 · 还能继续合成隐藏人物！' : '书记登场，继续向大书记进发！'));
    root.classList.toggle('is-achievement', isAchievement);
    root.classList.toggle('is-clearing', isClear);
    root.classList.toggle('is-final', Number(number) === 1);
    root.classList.toggle('is-preview', !!options.persistent);
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 100; i++) {
      const piece = document.createElement('i');
      const x = Math.random() * 100;
      piece.className = 'celebration-piece' + (i % 5 === 0 ? ' is-star' : '');
      piece.style.setProperty('--x', x + 'vw');
      piece.style.setProperty('--drift', (Math.random() * 34 - 17) + 'vw');
      piece.style.setProperty('--delay', (options.persistent ? -Math.random() * 3 : Math.random() * (isFinal ? .6 : .08)) + 's');
      piece.style.setProperty('--fall', (isFinal ? 2.2 + Math.random() * 1.2 : .8 + Math.random() * .3) + 's');
      piece.style.setProperty('--spin', (Math.random() * 1080 - 540) + 'deg');
      piece.style.setProperty('--color', colors[i % colors.length]);
      fragment.appendChild(piece);
    }
    confetti.appendChild(fragment);
    root.hidden = false;
    void root.offsetWidth;
    root.classList.add('is-celebrating');
    if (!options.persistent) timer = setTimeout(clear, isAchievement ? 2200 : (isClear ? 1800 : (isFinal ? 3800 : 1200)));
    return true;
  }
  // 吃掉关闭动画的整次点击，避免触屏松手或鼠标点击顺便投放人物。
  document.addEventListener('pointerdown', (event) => {
    if (root.hidden) return;
    dismissedPointer = event.pointerId;
    suppressClick = true;
    clear();
    event.preventDefault();
    event.stopImmediatePropagation();
  }, { capture: true, passive: false });
  document.addEventListener('pointerup', (event) => {
    if (dismissedPointer !== null && event.pointerId === dismissedPointer) {
      dismissedPointer = null;
      event.preventDefault();
      event.stopImmediatePropagation();
    } else if (!root.hidden && event.pointerType === 'touch') {
      clear();
      suppressClick = true;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, { capture: true, passive: false });
  document.addEventListener('pointercancel', () => { dismissedPointer = null; suppressClick = false; }, true);
  document.addEventListener('click', (event) => {
    if (suppressClick || !root.hidden) {
      suppressClick = false;
      clear();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('keydown', (event) => {
    if (!root.hidden && ['Escape', 'Space', 'Enter'].includes(event.code)) {
      clear();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  window.DashujiCelebration = { show, clear, showClear(number, bonus) { return show(number, {clearBonus: bonus}); }, showAchievement() { return show(3, {achievement: true}); } };
})();
