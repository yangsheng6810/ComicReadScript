import { useInit } from 'main';
import {
  createEffectOn,
  onUrlChange,
  querySelectorAll,
  waitUrlChange,
} from 'helper';

(async () => {
  const isMangaPage = () => location.pathname.includes('/post/');
  await waitUrlChange(isMangaPage);

  const {
    options,
    setComicLoad,
    showComic,
    switchComic,
    needAutoShow,
    setFab,
    setManga,
    setComicMap,
  } = await useInit('kemono', {
    autoShow: false,
    defaultOption: { pageNum: 1 },
    /** 加载原图 */
    load_original_image: true,
  });

  setComicLoad(
    () =>
      querySelectorAll<HTMLAnchorElement>('.post__thumbnail a').map(
        (e) => e.href,
      ),
    'original',
  );
  setComicLoad(
    () =>
      querySelectorAll<HTMLImageElement>('.post__thumbnail img').map(
        (e) => e.src,
      ),
    'thumbnail',
  );

  // 在切换时重新获取图片
  createEffectOn(
    () => options.load_original_image,
    (isOriginal, prev) => {
      if (!prev) return switchComic(isOriginal ? 'original' : 'thumbnail');
      needAutoShow.val = options.autoShow;
      showComic(isOriginal ? 'original' : 'thumbnail');
    },
  );

  // 加上跳转至 pwa 的链接
  const zipExtension = new Set(['zip', 'rar', '7z', 'cbz', 'cbr', 'cb7']);
  for (const e of querySelectorAll<HTMLAnchorElement>('.post__attachment a')) {
    if (!zipExtension.has(e.href.split('.').pop()!)) continue;
    const a = document.createElement('a');
    a.href = `https://comic-read.pages.dev/?url=${encodeURIComponent(e.href)}`;
    a.textContent = e.textContent!.replace('Download ', 'ComicReadPWA - ');
    a.className = e.className;
    a.style.opacity = '.6';
    e.parentNode!.insertBefore(a, e.nextElementSibling);
  }

  onUrlChange(async () => {
    if (!isMangaPage()) {
      setFab('show', false);
      setManga({ show: false });
      setComicMap('original', 'imgList', undefined);
      setComicMap('thumbnail', 'imgList', undefined);
      return;
    }

    setFab('show', undefined);
    setManga({ onPrev: undefined, onNext: undefined });
    needAutoShow.val = options.autoShow;
    setComicMap('', 'imgList', undefined);
    if (needAutoShow.val && options.autoShow) await showComic('');
  });
})();
