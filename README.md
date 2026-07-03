# Record of Ragnarok Name Archive

Production source cho landing page danh sách tên Record of Ragnarok.

## Nội dung

- React + Vite
- 28 nhóm
- 332 tên
- Phân nhóm theo thần thoại, RoR Canon, Valkyrie, cõi giới, chiến binh và quái vật
- Tìm kiếm tên, mô tả và nhóm
- Lọc theo nhóm
- Copy từng tên
- Copy toàn bộ danh sách
- Light / dark mode
- Chuyển bố cục Grid / Compact / List
- Tương thích Netlify

## Cấu trúc

```text
index.html
package.json
package-lock.json
netlify.toml
src/
  App.jsx
  main.jsx
  styles.css
  data/
    names.js
public/
  favicon.svg
```

## Chạy local

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

## Deploy Netlify

```text
Build command: npm run build
Publish directory: dist
```

File `netlify.toml` đã khai báo sẵn cấu hình build.
