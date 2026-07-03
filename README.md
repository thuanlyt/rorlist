# Record of Ragnarok · Mythology Master List

Source landing page cho danh sách tên Record of Ragnarok.

## Nội dung

- 28 nhóm
- 332 tên
- Giữ đủ 100 tên cũ
- Có bổ sung hệ Bắc Âu
- Có bổ sung các nhóm nổi bật trong anime `Record of Ragnarok`
- Có thêm RoR Canon: Einherjar, Đấu Sĩ Thần, 13 Valkyrie
- Có thêm Ấn Độ, Nhật Bản, Ai Cập, Phương Đông, Celtic / Ba Tư
- Có nhóm riêng cho Ngoại thần / Phản thần / Vực sâu
- Dùng React + Vite
- Icon dùng `lucide-react`
- Giao diện sáng/tối
- Nút floating đổi bố cục
- Copy từng tên
- Copy toàn bộ danh sách
- Tìm kiếm và lọc theo nhóm
- Dropdown đã chuyển sang custom dropdown để tránh lỗi giao diện trên mobile
- Card tên đã được làm nổi bật hơn bằng nền accent nhẹ và viền accent rõ hơn

## Lưu ý dữ liệu

Một số tên có thể xuất hiện ở nhiều nhóm.
Ví dụ một nhân vật vừa nằm trong nhóm nguồn gốc thần thoại, vừa nằm trong nhóm `RoR Canon` để phản ánh đúng vai trò nổi bật trong anime.

## Cấu trúc

```text
index.html
package.json
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

## Upload lên GitHub

1. Giải nén file zip.
2. Mở repo GitHub `thuanlyt/rorlist`.
3. Chọn `uploading an existing file`.
4. Kéo toàn bộ file và thư mục trong folder đã giải nén lên repo.
5. Bấm `Commit changes`.

Lưu ý: upload phần **bên trong folder**, không upload nguyên folder cha nếu bạn muốn repo sạch.

## Deploy lên Netlify từ GitHub

Trong Netlify, chọn project hiện tại hoặc tạo project mới:

```text
Add new site
→ Import an existing project
→ GitHub
→ chọn repo thuanlyt/rorlist
```

Cấu hình build:

```text
Build command: npm run build
Publish directory: dist
```

File `netlify.toml` đã khai báo sẵn cấu hình này, nên Netlify thường sẽ tự nhận.

## Chạy thử trên máy

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Sửa danh sách tên

Mở file:

```text
src/data/names.js
```

Mỗi nhóm có dạng:

```js
{
  id: 'norse-gods',
  title: 'Thần Bắc Âu',
  subtitle: '...',
  origin: 'Bắc Âu',
  items: [
    { id: '...', name: 'Odin', desc: 'thần tối cao của Bắc Âu', origin: 'Bắc Âu' }
  ]
}
```

Sau khi sửa, commit lên GitHub. Netlify sẽ tự deploy lại.

## Muốn trang tồn tại lâu dài

- Không xoá repo GitHub.
- Không xoá project Netlify.
- Backup file source zip này.
- Nên gắn domain riêng nếu muốn link ổn định và đẹp hơn.
- Không phụ thuộc Netlify Drop nữa, vì source đã nằm trong GitHub.
