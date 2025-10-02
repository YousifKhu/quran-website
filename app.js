/* app.js
   تحكم بعرض صفحات المصحف، الحفظ محلياً، البحث عن السور، وغيرها.
   افترض أن الصور باسم: images/pages/001.jpg ... 604.jpg
*/
(() => {
  const TOTAL_PAGES = 604; // عدّل إذا كان عدد صفحات المصحف مختلف
  const IMAGE_PATH = index => `images/pages/${String(index).padStart(3,'0')}.jpg`;

  // عناصر DOM
  const imgEl = document.getElementById('mushafImg');
  const currentPageEl = document.getElementById('currentPage');
  const pageInput = document.getElementById('pageInput');
  const totalPagesEl = document.getElementById('totalPages');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const toggleDark = document.getElementById('toggleDark');

  // Sidebar surah list
  const surahListEl = document.getElementById('surahList');
  const searchSurah = document.getElementById('searchSurah');

  // الحالة
  let state = {
    page: 1
  };

  // حمل عدد الصفحات
  totalPagesEl.textContent = `/ ${TOTAL_PAGES}`;
  pageInput.value = state.page;

  // تهيئة الصفحة من localStorage
  const saved = localStorage.getItem('mushaf_state_v1');
  if(saved){
    try{ state = {...state, ...JSON.parse(saved)} }catch(e){}
  }

  // تحديث العرض للصفحة الحالية
  function renderPage(){
    const idx = state.page;
    imgEl.src = IMAGE_PATH(idx);
    imgEl.alt = `صفحة المصحف رقم ${idx}`;
    currentPageEl.textContent = idx;
    pageInput.value = idx;
    updateBookmarkUI();
    // تغيير رابط التحميل
    downloadBtn.dataset.href = IMAGE_PATH(idx);
  }

  function gotoPage(n){
    const p = Math.max(1, Math.min(TOTAL_PAGES, Math.floor(n)));
    state.page = p;
    renderPage();
    saveState();
  }

  prevBtn.addEventListener('click', () => gotoPage(state.page - 1));
  nextBtn.addEventListener('click', () => gotoPage(state.page + 1));
  pageInput.addEventListener('change', (e) => gotoPage(Number(e.target.value) || 1));

  // مفاتيح لوحة المفاتيح (يمين/يسار للتصفح)
  window.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft'){ gotoPage(state.page - 1); }
    if(e.key === 'ArrowRight'){ gotoPage(state.page + 1); }
    if(e.key === '+' || e.key === '='){ zoomImage(1.1); }
    if(e.key === '-'){ zoomImage(0.9); }
  });

  // حفظ الحالة
  function saveState(){
    localStorage.setItem('mushaf_state_v1', JSON.stringify({ page: state.page }));
  }

  // المفضلة (bookmark) - حفظ رقم الصفحة
  function toggleBookmark(){
    const bookmarks = JSON.parse(localStorage.getItem('mushaf_bookmarks_v1') || '[]');
    const idx = state.page;
    const pos = bookmarks.indexOf(idx);
    if(pos === -1){
      bookmarks.push(idx);
    } else {
      bookmarks.splice(pos,1);
    }
    localStorage.setItem('mushaf_bookmarks_v1', JSON.stringify(bookmarks));
    updateBookmarkUI();
  }
  function updateBookmarkUI(){
    const bookmarks = JSON.parse(localStorage.getItem('mushaf_bookmarks_v1') || '[]');
    const idx = state.page;
    bookmarkBtn.textContent = bookmarks.includes(idx) ? '★' : '☆';
  }
  bookmarkBtn.addEventListener('click', toggleBookmark);

  // تحميل الصورة
  downloadBtn.addEventListener('click', () => {
    const href = downloadBtn.dataset.href || imgEl.src;
    // تنزيل مباشر
    const a = document.createElement('a');
    a.href = href;
    a.download = `mushaf_page_${String(state.page).padStart(3,'0')}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // ملء الشاشة
  fullscreenBtn.addEventListener('click', async () => {
    try{
      if(!document.fullscreenElement){
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    }catch(e){}
  });

  // تكبير/تصغير صورة (بسيط)
  let currentScale = 1;
  function zoomImage(factor){
    currentScale = Math.max(0.5, Math.min(3, currentScale * factor));
    imgEl.style.transform = `scale(${currentScale})`;
    imgEl.style.transition = 'transform 150ms';
  }
  // التكبير عند النقر المزدوج
  imgEl.addEventListener('dblclick', () => {
    if(currentScale === 1) zoomImage(1.6); else { currentScale = 1; imgEl.style.transform = ''; }
  });

  // إنشاء قائمة السور (مقطوعة مبسطة — يمكنك توسيعها)
  const SURAH_DATA = [
    {num:1, name:"الفاتحة", startPage:1},
    {num:2, name:"البقرة", startPage:2},
    {num:3, name:"آل عمران", startPage:50},
    {num:4, name:"النساء", startPage:77},
    {num:5, name:"المائدة", startPage:106},
    {num:6, name:"الأنعام", startPage:128},
    {num:7, name:"الأعراف", startPage:151},
    {num:8, name:"الأنفال", startPage:177},
    {num:9, name:"التوبة", startPage:187},
    {num:10, name:"يونس", startPage:208},
    {num:11, name:"هود", startPage:221},
    {num:12, name:"يوسف", startPage:235},
    {num:13, name:"الرعد", startPage:249},
    {num:14, name:"إبراهيم", startPage:255},
    {num:15, name:"الحجر", startPage:262},
    {num:16, name:"النحل", startPage:267},
    {num:17, name:"الإسراء", startPage:282},
    {num:18, name:"الكهف", startPage:293},
    {num:19, name:"مريم", startPage:305},
    {num:20, name:"طه", startPage:312},
    {num:21, name:"الأنبياء", startPage:322},
    {num:22, name:"الحج", startPage:332},
    {num:23, name:"المؤمنون", startPage:342},
    {num:24, name:"النور", startPage:350},
    {num:25, name:"الفرقان", startPage:359},
    {num:26, name:"الشعراء", startPage:367},
    {num:27, name:"النمل", startPage:377},
    {num:28, name:"القصص", startPage:385},
    {num:29, name:"العنكبوت", startPage:396},
    {num:30, name:"الروم", startPage:404},
    {num:31, name:"لقمان", startPage:411},
    {num:32, name:"السجدة", startPage:415},
    {num:33, name:"الأحزاب", startPage:418},
    {num:34, name:"سبأ", startPage:428},
    {num:35, name:"فاطر", startPage:434},
    {num:36, name:"يس", startPage:440},
    {num:37, name:"الصافات", startPage:446},
    {num:38, name:"ص", startPage:453},
    {num:39, name:"الزمر", startPage:458},
    {num:40, name:"غافر", startPage:467},
    {num:41, name:"فصلت", startPage:477},
    {num:42, name:"الشورى", startPage:483},
    {num:43, name:"الزخرف", startPage:489},
    {num:44, name:"الدخان", startPage:496},
    {num:45, name:"الجاثية", startPage:499},
    {num:46, name:"الأحقاف", startPage:502},
    {num:47, name:"محمد", startPage:507},
    {num:48, name:"الفتح", startPage:511},
    {num:49, name:"الحجرات", startPage:515},
    {num:50, name:"ق", startPage:518},
    {num:51, name:"الذاريات", startPage:520},
    {num:52, name:"الطور", startPage:523},
    {num:53, name:"النجم", startPage:526},
    {num:54, name:"القمر", startPage:528},
    {num:55, name:"الرحمن", startPage:531},
    {num:56, name:"الواقعة", startPage:534},
    {num:57, name:"الحديد", startPage:537},
    {num:58, name:"المجادلة", startPage:542},
    {num:59, name:"الحشر", startPage:545},
    {num:60, name:"الممتحنة", startPage:549},
    {num:61, name:"الصف", startPage:551},
    {num:62, name:"الجمعة", startPage:553},
    {num:63, name:"المنافقون", startPage:554},
    {num:64, name:"التغابن", startPage:556},
    {num:65, name:"الطلاق", startPage:558},
    {num:66, name:"التحريم", startPage:560},
    {num:67, name:"الملك", startPage:562},
    {num:68, name:"القلم", startPage:564},
    {num:69, name:"الحاقة", startPage:566},
    {num:70, name:"المعارج", startPage:568},
    {num:71, name:"نوح", startPage:570},
    {num:72, name:"الجن", startPage:572},
    {num:73, name:"المزّمّل", startPage:574},
    {num:74, name:"المدّثر", startPage:575},
    {num:75, name:"القيامة", startPage:577},
    {num:76, name:"الإنسان", startPage:578},
    {num:77, name:"المرسلات", startPage:580},
    {num:78, name:"النبأ", startPage:582},
    {num:79, name:"النازعات", startPage:583},
    {num:80, name:"عبس", startPage:585},
    {num:81, name:"التكوير", startPage:586},
    {num:82, name:"الانفطار", startPage:587},
    {num:83, name:"المطفّفين", startPage:587},
    {num:84, name:"الانشقاق", startPage:589},
    {num:85, name:"البروج", startPage:590},
    {num:86, name:"الطارق", startPage:591},
    {num:87, name:"الأعلى", startPage:591},
    {num:88, name:"الغاشية", startPage:592},
    {num:89, name:"الفجر", startPage:593},
    {num:90, name:"البلد", startPage:594},
    {num:91, name:"الشمس", startPage:595},
    {num:92, name:"الليل", startPage:595},
    {num:93, name:"الضحى", startPage:596},
    {num:94, name:"الشرح", startPage:596},
    {num:95, name:"التين", startPage:597},
    {num:96, name:"العلق", startPage:597},
    {num:97, name:"القدر", startPage:598},
    {num:98, name:"البينة", startPage:598},
    {num:99, name:"الزلزلة", startPage:599},
    {num:100, name:"العاديات", startPage:599},
    {num:101, name:"القارعة", startPage:600},
    {num:102, name:"التكاثر", startPage:600},
    {num:103, name:"العصر", startPage:601},
    {num:104, name:"الهمزة", startPage:601},
    {num:105, name:"الفيل", startPage:601},
    {num:106, name:"قريش", startPage:602},
    {num:107, name:"الماعون", startPage:602},
    {num:108, name:"الكوثر", startPage:602},
    {num:109, name:"الكافرون", startPage:603},
    {num:110, name:"النصر", startPage:603},
    {num:111, name:"المسد", startPage:603},
    {num:112, name:"الإخلاص", startPage:604},
    {num:113, name:"الفلق", startPage:604},
    {num:114, name:"الناس", startPage:604},
    // ملاحظة: صفحات البداية هنا تقريبية، يجب تعديلها حسب المصحف المستخدم

    // ... أضف باقي السور مع صفحات البداية المناسبة
  ];

  function renderSurahList(filter=''){
    surahListEl.innerHTML = '';
    const filtered = SURAH_DATA.filter(s => s.name.includes(filter) || String(s.num) === filter);
    for(const s of filtered){
      const el = document.createElement('div');
      el.className = 'surah-item';
      el.innerHTML = `<div><strong>${s.name}</strong><div style="font-size:0.85rem;color:var(--muted)">سورة ${s.num}</div></div>
                      <div><button class="goto">اذهب</button></div>`;
      el.querySelector('.goto').addEventListener('click', () => gotoPage(s.startPage));
      surahListEl.appendChild(el);
    }
  }
  renderSurahList();

  searchSurah.addEventListener('input', (e) => renderSurahList(e.target.value.trim()));

  // الوضع الداكن
  toggleDark.addEventListener('change', (e) => {
    document.body.classList.toggle('dark', e.target.checked);
    localStorage.setItem('mushaf_theme_v1', e.target.checked ? 'dark' : 'light');
  });
  // تهيئة الوضع من التخزين
  const theme = localStorage.getItem('mushaf_theme_v1');
  if(theme === 'dark'){ toggleDark.checked = true; document.body.classList.add('dark'); }

  // تهيئة العرض
  gotoPage(state.page || 1);

  // lazy-load safety: إذا تغيّرت الصورة قبل التحميل (cache fallback)
  imgEl.addEventListener('error', () => {
    imgEl.src = 'images/pages/placeholder.jpg'; // ضع صورة احتياطية إن أردت
  });

  // اقتراح: تحميل مُسبق لصفحتين حول الصفحة الحالية لتحسين تجربة التصفح
  function preloadAround(page){
    [page-1, page+1].forEach(p => {
      if(p >=1 && p <= TOTAL_PAGES){
        const im = new Image();
        im.src = IMAGE_PATH(p);
      }
    });
  }
  // استمع لحدث التحميل لتشغيل preload
  imgEl.addEventListener('load', () => preloadAround(state.page));
})();
