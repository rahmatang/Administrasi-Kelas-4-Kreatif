/* ============================================================
 * api.js  —  jembatan GitHub Pages  <->  Google Apps Script
 *
 * SATU-SATUNYA YANG PERLU DIEDIT: isi API_URL di bawah dengan
 * URL Web App Apps Script kamu (yang berakhiran /exec).
 * ============================================================ */
var API_URL = 'https://script.google.com/macros/s/AKfycbyV6_ky_A_8hHomQKGHVRuF4rLbZ2EFeNmxGBKOZijnm25xBz2BYmSrH5wBCR_p7Jvj/exec';

/* Meniru google.script.run supaya seluruh kode di index.html
 * tidak perlu diubah: google.script.run
 *   .withSuccessHandler(fn).withFailureHandler(fn).namaFungsi(arg1, arg2) */
(function () {
  function callApi(fn, args, onOk, onErr) {
    fetch(API_URL, {
      method: 'POST',
      // text/plain = "simple request", jadi browser tidak perlu preflight CORS
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args }),
      redirect: 'follow'
    })
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var res;
        try { res = JSON.parse(txt); }
        catch (e) {
          throw new Error('Server tidak membalas dengan benar. Pastikan Web App di-deploy dengan akses "Anyone" dan URL di api.js sudah benar.');
        }
        if (res && res.ok) { if (onOk) onOk(res.result); }
        else { throw new Error((res && res.error) || 'Terjadi kesalahan di server.'); }
      })
      .catch(function (err) {
        if (!(err instanceof Error)) err = new Error(String(err));
        if (/failed to fetch|networkerror|load failed/i.test(err.message)) {
          err = new Error('Tidak bisa terhubung ke server. Periksa koneksi internet Anda.');
        }
        if (onErr) onErr(err);
        else console.error('[API ' + fn + ']', err);
      });
  }

  function runner(onOk, onErr) {
    return new Proxy({}, {
      get: function (_, name) {
        if (name === 'withSuccessHandler') return function (f) { return runner(f, onErr); };
        if (name === 'withFailureHandler') return function (f) { return runner(onOk, f); };
        if (typeof name !== 'string') return undefined;
        return function () {
          callApi(name, Array.prototype.slice.call(arguments), onOk, onErr);
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = { run: runner(null, null) };
})();
