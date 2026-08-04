(function(){
  /* Pre-bundled tracks — shipped inside /tracks next to this HTML file.
     Add more entries here as you receive the rest of the album. */
  const PRELOADED_TRACKS = [
    { num: 1,  filename: "01_-_Elegie.flac" },
    { num: 2,  filename: "02_-_IDK.flac" },
    { num: 3,  filename: "03_-_Wtf_Bby_I'm_Lit.flac" },
    { num: 4,  filename: "04_-_Anh_Không_Muốn_Nó_Dễ_Dàng.flac" },
    { num: 5,  filename: "05_-_Baby__feat__marzuz.flac" },
    { num: 6,  filename: "06_-_Yêu_Anh_Giết_Anh.flac" },
    { num: 7,  filename: "07_-_Mắt_Môi_Tay_Chân__feat__Tage.flac" },
    { num: 8,  filename: "08_-_Đao_Của_Anh_Vừa.flac" },
    { num: 9,  filename: "09_-_Là_Gì_Của_Nhau.flac" },
    { num: 10, filename: "10_-_Night_In_Prague.flac" },
    { num: 11, filename: "11_-_Một_Cái_Ôm.flac" },
    { num: 12, filename: "12_-_Liệm.flac" },
    { num: 13, filename: "13_-_Nếu_Như_Ta_Chẳng_Còn__feat__A$AP_Ướt_Mi.flac" },
    { num: 14, filename: "14_-_Ai_Mới_Là_Kẻ_Xấu_Xa.flac" },
    { num: 15, filename: "15_-_Slippery__feat__Tùng_Dương.flac" },
    { num: 16, filename: "16_-_Intenpol.flac" },
    { num: 17, filename: "17_-_Tây_Thi.flac" },
    { num: 18, filename: "18_-_Hút_và_Hút.flac" },
    { num: 19, filename: "19_-_Dưa_Chua.flac" },
    { num: 20, filename: "20_-_Xa_Xôi__feat__Obito.flac" },
    { num: 21, filename: "21_-_Che_Phủ.flac" },
    { num: 22, filename: "22_-_Oanh_M_=_Thuoc.flac" },
    { num: 23, filename: "23_-_Ghet_Xog_Lai_Thik.flac" },
    { num: 24, filename: "24_-_Nhìn_Kẻ_Thù_Của_Tao.flac" },
    { num: 25, filename: "25_-_Envy__feat__THANHDRAW.flac" },
    { num: 26, filename: "26_-_Cảm_Ơn.flac" },
    { num: 27, filename: "27_-_Không_Cần_Lo_Cho_Tao.flac" },
    { num: 28, filename: "28_-_Huh__feat__RPT_Orijinn_&_THANHDRAW.flac" },
    { num: 29, filename: "29_-_Nguyễn_Văn_Mười.flac" },
    { num: 30, filename: "30_-_Thịt_Lợn.flac" }
  ].map(t => ({ ...t, art: 'covers/' + String(t.num).padStart(2,'0') + '.jpg' }));
  const COVER_PATH = "cover.jpg";

  const state = { tracks: [], currentIndex: -1, playing: false, shuffle: false, repeatMode: 'all' };

  const playlistEl = document.getElementById('playlist');
  const loadedCount = document.getElementById('loadedCount');
  const playlistHint = document.getElementById('playlistHint');

  const audio = document.getElementById('audio');
  const seek = document.getElementById('seek');
  const curTime = document.getElementById('curTime');
  const durTime = document.getElementById('durTime');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const volume = document.getElementById('volume');
  const disc = document.getElementById('disc');
  const discWrap = document.getElementById('discWrap');
  const discFlip = document.getElementById('discFlip');
  const discFaceFront = document.getElementById('discFaceFront');
  const discFaceBack = document.getElementById('discFaceBack');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const npTitle = document.getElementById('npTitle');
  const npSub = document.getElementById('npSub');

  audio.volume = parseFloat(volume.value);

  const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
  const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';

  function parseFilename(filename){
    let name = filename.replace(/\.(m4a|flac)$/i, '');
    let num = '';
    let m = name.match(/^(\d+)[_\-\s]+-?[_\-\s]*(.+)$/);
    let rest = name;
    if(m){ num = m[1]; rest = m[2]; }
    let title, feat = null;
    const featMatch = rest.match(/^(.+?)__feat__(.+?)_*$/i);
    if(featMatch){
      title = featMatch[1].replace(/_/g,' ').replace(/\s+/g,' ').trim();
      feat = featMatch[2].replace(/_/g,' ').replace(/\s+/g,' ').trim();
    } else {
      title = rest.replace(/_/g,' ').replace(/\s+/g,' ').trim();
    }
    title = title.replace(/\bI m\b/gi, "I'm");
    return { num: num ? parseInt(num,10) : 9999, title: title || filename, feat };
  }

  function formatTime(sec){
    if(!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60);
    return m + ':' + String(s).padStart(2,'0');
  }

  function addTrack(filename, url, art){
    if(state.tracks.some(t => t.filename === filename)) return;
    const parsed = parseFilename(filename);
    state.tracks.push({
      filename,
      num: parsed.num,
      title: parsed.title,
      feat: parsed.feat,
      url,
      art: art || null
    });
  }

  function handleFiles(fileList){
    const files = Array.from(fileList).filter(f => /\.(m4a|flac)$/i.test(f.name) || f.type.startsWith('audio'));
    if(files.length === 0) return;
    files.forEach(file => addTrack(file.name, URL.createObjectURL(file)));
    state.tracks.sort((a,b) => a.num - b.num);
    renderPlaylist();
  }

  function renderPlaylist(){
    loadedCount.textContent = state.tracks.length;
    playlistEl.innerHTML = '';

    if(state.tracks.length === 0){
      playlistHint.textContent = 'No tracks loaded yet';
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'Drop .m4a or .flac files into the panel on the left to start listening.';
      playlistEl.appendChild(empty);
      return;
    }

    playlistHint.textContent = state.tracks.length + ' tracks · click to play';

    state.tracks.forEach((track, idx) => {
      const li = document.createElement('li');
      li.className = 'track' + (idx === state.currentIndex ? ' active' : '');
      li.innerHTML = `
        <span class="track-num">${String(track.num).padStart(2,'0')}</span>
        <div class="track-info-row">
          ${track.art ? `<img class="track-thumb" src="${track.art}" alt="" loading="lazy">` : '<div class="track-thumb track-thumb-empty"></div>'}
          <div class="track-info">
            <span class="track-title">${escapeHtml(track.title)}</span>
            ${track.feat ? `<span class="track-feat">feat. ${escapeHtml(track.feat)}</span>` : ''}
          </div>
        </div>
        <span class="track-dur">
          <span class="eq"><span></span><span></span><span></span></span>
        </span>
      `;
      li.addEventListener('click', () => playTrack(idx));
      playlistEl.appendChild(li);
    });
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function playTrack(idx){
    if(idx < 0 || idx >= state.tracks.length) return;
    state.currentIndex = idx;
    const track = state.tracks[idx];
    audio.src = track.url;
    audio.play().catch(()=>{});
    updateNowPlaying();
    if(track.art){
      discFaceBack.style.backgroundImage = `url("${track.art}")`;
      discFlip.classList.add('flipped');
    } else {
      discFlip.classList.remove('flipped');
    }
    renderPlaylist();
  }

  function updateNowPlaying(){
    const track = state.tracks[state.currentIndex];
    if(!track){
      npTitle.textContent = 'Nothing playing';
      npSub.textContent = 'Pick a track to start';
      return;
    }
    npTitle.textContent = track.title;
    npSub.textContent = track.feat ? ('feat. ' + track.feat) : ('Track ' + String(track.num).padStart(2,'0'));
  }

  function getNextIndex(){
    if(state.shuffle && state.tracks.length > 1){
      let idx;
      do{ idx = Math.floor(Math.random() * state.tracks.length); } while(idx === state.currentIndex);
      return idx;
    }
    return state.currentIndex + 1 < state.tracks.length ? state.currentIndex + 1 : -1;
  }

  function togglePlay(){
    if(state.currentIndex === -1){
      if(state.tracks.length > 0) playTrack(0);
      return;
    }
    if(audio.paused){ audio.play().catch(()=>{}); }
    else { audio.pause(); }
  }

  audio.addEventListener('play', () => {
    state.playing = true;
    playIcon.innerHTML = ICON_PAUSE;
    disc.classList.add('playing');
  });
  audio.addEventListener('pause', () => {
    state.playing = false;
    playIcon.innerHTML = ICON_PLAY;
    disc.classList.remove('playing');
  });
  audio.addEventListener('ended', () => {
    if(state.repeatMode === 'one'){
      audio.currentTime = 0;
      audio.play().catch(()=>{});
      return;
    }
    let next = getNextIndex();
    if(next === -1 && state.tracks.length > 0){
      next = state.shuffle ? Math.floor(Math.random() * state.tracks.length) : 0;
    }
    if(next !== -1){
      playTrack(next);
    } else {
      disc.classList.remove('playing');
    }
  });
  audio.addEventListener('timeupdate', () => {
    if(!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    seek.style.background = `linear-gradient(to right, var(--ice) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
    curTime.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', () => {
    durTime.textContent = formatTime(audio.duration);
    seek.disabled = false;
  });

  seek.addEventListener('input', () => {
    if(!audio.duration) return;
    audio.currentTime = (seek.value / 100) * audio.duration;
  });

  volume.addEventListener('input', () => { audio.volume = parseFloat(volume.value); });

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => {
    if(audio.currentTime > 3){ audio.currentTime = 0; return; }
    if(state.currentIndex > 0) playTrack(state.currentIndex - 1);
  });
  nextBtn.addEventListener('click', () => {
    let next = getNextIndex();
    if(next === -1 && state.tracks.length > 0){
      next = state.shuffle ? Math.floor(Math.random() * state.tracks.length) : 0;
    }
    if(next !== -1) playTrack(next);
  });
  repeatBtn.classList.toggle('repeat-one', state.repeatMode === 'one');
  repeatBtn.title = state.repeatMode === 'one' ? 'Repeat one (on)' : 'Repeat one';

  shuffleBtn.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    shuffleBtn.classList.toggle('active', state.shuffle);
  });
  repeatBtn.addEventListener('click', () => {
    state.repeatMode = state.repeatMode === 'one' ? 'all' : 'one';
    repeatBtn.classList.toggle('repeat-one', state.repeatMode === 'one');
    repeatBtn.classList.toggle('active', state.repeatMode === 'one');
    repeatBtn.title = state.repeatMode === 'one' ? 'Repeat one (on)' : 'Repeat one';
  });

  discWrap.addEventListener('click', () => {
    discFlip.classList.toggle('flipped');
  });

  document.addEventListener('keydown', (e) => {
    if(e.code === 'Space' && document.activeElement.tagName !== 'INPUT'){
      e.preventDefault();
      togglePlay();
    }
  });

  /* Load the bundled cover art */
  const testImg = new Image();
  testImg.onload = () => { discFaceFront.style.backgroundImage = `url("${COVER_PATH}")`; };
  testImg.src = COVER_PATH;

  /* Load the bundled tracks from /tracks (relative path — works locally and once hosted) */
  PRELOADED_TRACKS.forEach(t => addTrack(t.filename, 'tracks/' + t.filename, t.art));
  state.tracks.sort((a,b) => a.num - b.num);
  renderPlaylist();
})();
