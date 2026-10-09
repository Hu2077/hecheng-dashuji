/* 合成指定人物时，全屏恭喜。预览与正常游戏共用同一个效果。 */
(function () {
  'use strict';
  const messages = {
    4: '合成书记：厉sir！',
    3: '合成书记，马sir！',
    2: '合成书记，龚sir！',
    1: '恭喜合成大书记：竹sir！'
  };
  const root = document.getElementById('celebration');
  const title = document.getElementById('celebrationTitle');
  const portrait = document.getElementById('celebrationPortrait');
  const caption = document.getElementById('celebrationCaption');
  const confetti = document.getElementById('celebrationConfetti');
  const colors = ['#ff637f','#ffc83d','#51c7e8','#a07dff','#fff4b3','#6bdca1'];
  let timer = null;

  function clear() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    root.hidden = true;
    root.classList.remove('is-celebrating', 'is-final', 'is-preview');
    confetti.textContent = '';
  }
  function show(number, options = {}) {
    if (!Object.prototype.hasOwnProperty.call(messages, number)) return false;
    const isFinal = Number(number) === 1;
    clear();
    title.textContent = messages[number];
    portrait.src = 'assets/characters/person-' + number + '.webp';
    portrait.alt = messages[number];
    caption.textContent = Number(number) === 1 ? '最高等级达成 · 大书记登场！' : '书记登场，继续向大书记进发！';
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
    if (!options.persistent) timer = setTimeout(clear, isFinal ? 3800 : 1200);
    return true;
  }
  window.DashujiCelebration = { show, clear };
})();
