/**
 *  hsv2rgb (h, s, v)
 */
function hsv2rgb(h, s, v) {
    // 引数処理
    h = (h < 0 ? h % 360 + 360 : h) % 360 / 60;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    v = v < 0 ? 0 : v > 1 ? 1 : v;
  
    // HSV to RGB 変換
    const c = [5, 3, 1].map(n =>
      Math.round((v - Math.max(0, Math.min(1, 2 - Math.abs(2 - (h + n) % 6))) * s * v) * 255));
  
    // 戻り値
    return {
      hex: `#${(c[0] << 16 | c[1] << 8 | c[2]).toString(16).padStart(6, '0')}`,
      rgb: c, r: c[0], g: c[1], b: c[2],
    };
  }
  
  /**
   *  rgb2hsv (r, g, b)
   *  rgb2hsv (colorcode)
   */
  function rgb2hsv(r, g, b) {
    // 引数処理
    let tmp = [r, g, b];
    if (r !== void 0 && g === void 0) {
      const cc = parseInt(r.toString().replace(/[^\da-f]/ig, '').replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3"), 16);
      tmp = [cc >> 16 & 0xff, cc >> 8 & 0xff, cc & 0xff];
    }
    else {
      for (let i in tmp) tmp[i] = Math.max(0, Math.min(255, Math.floor(tmp[i])));
    }
    [r, g, b] = tmp;
  
    // RGB to HSV 変換
    const
      v = Math.max(r, g, b), d = v - Math.min(r, g, b),
      s = v ? d / v : 0, a = [r, g, b, r, g], i = a.indexOf(v),
      h = s ? (((a[i + 1] - a[i + 2]) / d + i * 2 + 6) % 6) * 60 : 0;
  
    // 戻り値
    return {h, s, v: v / 255};
  }
  
  function sl2sv(s, l) {
    s = s < 0 ? 0 : s > 1 ? 1 : +s;
    l = l < 0 ? 0 : l > 1 ? 1 : +l;
    const
      n = l + s * Math.min(l, 1 - l),
      s_ = n ? (1 - l / n) * 2 : sl2sv(s, .5)[0];
    return [s_, n];
  }
  
  function sv2sl(s, v) {
    s = s < 0 ? 0 : s > 1 ? 1 : +s;
    v = v < 0 ? 0 : v > 1 ? 1 : +v;
    const
      n = v * (1 - s / 2),
      s_ = n ? (v - n) / Math.min(n, 1 - n) : sv2sl(s, .5)[0];
    return [s_, n];
  }
  
  /**
   *  hsl2rgb (h, s, l)
   */
  function hsl2rgb(h, s, l) {
    const sv = sl2sv(s, l);
    return hsv2rgb(h, sv[0], sv[1]);
  }
  
  /**
   *  hsl2hsv (h, s, l)
   */
  function hsl2hsv(h, s, l) {
    const sv = sl2sv(s, l);
    return {h, s: sv[0], v: sv[1]};
  }
  
  /**
   *  rgb2hsl (r, g, b)
   *  rgb2hsl (colorcode)
   */
  function rgb2hsl(r, g, b) {
    const
      hsv = rgb2hsv(r, g, b),
      sl = sv2sl(hsv.s, hsv.v);
    return {h: hsv.h, s: sl[0], l: sl[1]};
  }
  
  /**
   *  hsv2hsl (h, s, v)
   */
  function hsv2hsl(h, s, v) {
    const sl = sv2sl(s, v);
    return {h, s: sl[0], l: sl[1]};
  }
  