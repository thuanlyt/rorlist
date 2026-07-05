# Record of Ragnarok Name Archive

Web quản lý kho tên phong cách **Record of Ragnarok / thần thoại / hội game**. Dự án hỗ trợ xem danh sách tên, lọc trạng thái, quản trị tên đã dùng, đồng bộ dữ liệu qua Supabase, tùy chỉnh màu/mệnh từng tên và xem nhanh bảng thành viên đã đăng ký tên.

## Tính năng chính

- Trang chủ `/`: danh sách tên thần thoại và nhân vật được chia theo nhóm.
- Trang `/list`: bảng nhanh các tên đã được đăng ký.
- Tìm kiếm theo tên, nhóm, người sử dụng, liên hệ hoặc ghi chú.
- Lọc theo trạng thái: tất cả, còn trống, đã dùng.
- Chế độ Admin để gán tên cho người dùng trong game.
- Chế độ Admin có thể thêm **Tên tự do** cho thành viên không đặt theo danh sách tên có sẵn.
- Modal xem đầy đủ thông tin người đang sử dụng tên.
- Tùy chỉnh màu và mệnh cho từng tên.
- Màu/mệnh custom trên Supabase sẽ đè lên màu/mệnh mặc định trong source.
- Tùy chỉnh hiệu ứng tên nổi bật và đồng bộ hiệu ứng giữa các thiết bị.
- Dark mode / light mode.
- Responsive desktop, tablet và mobile.

## Trang `/list`

Trang `/list` hiển thị bảng các thành viên đã đăng ký tên.

Thứ tự cột:

```text
Tên cũ | Tên mới | Tên Zalo | Ghi chú
```

Mapping dữ liệu:

```text
Tên cũ   = Người đang sử dụng
Tên mới  = Tên thần tương ứng hoặc tên tự do do thành viên tự đặt
Tên Zalo = Danh tính / liên hệ
Ghi chú  = Ghi chú
```

Ở mọi trang, bấm vào icon hoặc chữ **Record of Ragnarok** trên header sẽ quay về trang chủ `/`.

## Tên tự do

**Tên tự do** dùng cho thành viên không đặt theo danh sách tên thần thoại/RoR có sẵn.

Admin có thể thêm tên tự do với các trường:

- Tên mới: tên sẽ hiển thị như tên thần.
- Tên cũ: người đang sử dụng tên đó.
- Danh tính / liên hệ: Zalo, Discord, ID game hoặc ghi chú liên hệ.
- Ghi chú: thông tin quản trị bổ sung.
- Màu / mệnh: màu và mệnh hiển thị trên card.
- Nhóm: luôn là `Tên tự do`.

Tên tự do luôn được tính là **Đã dùng**, xuất hiện trên trang chủ trong nhóm **Tên tự do** và cũng xuất hiện trong bảng `/list`.

## Biến môi trường

Tạo các biến sau trong Netlify hoặc Vercel:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_IMGBB_API_KEY=optional_if_image_upload_is_used_later
```

Không đưa mật khẩu admin vào `.env.example`, GitHub hoặc source frontend. Mật khẩu admin được tạo bằng SQL trong Supabase và được kiểm tra qua RPC.

## Cài đặt Supabase

1. Mở Supabase Dashboard.
2. Vào SQL Editor.
3. Mở file `supabase/schema.sql` trong source.
4. Thay placeholder `<ADMIN_PASSWORD>` bằng mật khẩu admin riêng của bạn ngay trong SQL Editor.
5. Chạy SQL một lần.
6. Không commit file SQL đã chứa mật khẩu thật lên GitHub.

Các bảng chính:

- `ror_admin_settings`: lưu hash mật khẩu admin.
- `ror_name_claims`: lưu tên đã được sử dụng và thông tin người dùng.
- `ror_ui_settings`: lưu hiệu ứng giao diện.
- `ror_name_styles`: lưu màu/mệnh custom từng tên có sẵn.
- `ror_free_names`: lưu tên tự do do Admin thêm, gồm tên mới, tên cũ, liên hệ, ghi chú và màu/mệnh.

Các RPC chính:

- `ror_admin_check`
- `ror_upsert_name_claim`
- `ror_delete_name_claim`
- `ror_update_ui_settings`
- `ror_upsert_name_style`
- `ror_delete_name_style`
- `ror_upsert_free_name`
- `ror_delete_free_name`

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Build production

```bash
npm run build
```

Cấu hình deploy:

```text
Build command: npm run build
Publish directory: dist
```

Netlify cần file `netlify.toml` để route `/list` hoạt động trực tiếp khi reload trang.

## Ghi chú bản quyền

Dự án này là công cụ quản lý danh sách tên do người dùng tự triển khai. Dự án không phải sản phẩm chính thức của **Record of Ragnarok**, Warner Bros. Japan, Coamix, Shinya Umemura, Takumi Fukui, Ajichika hoặc bất kỳ chủ sở hữu bản quyền liên quan nào.

Tên **Record of Ragnarok** và các nhân vật thuộc tác phẩm gốc được dùng với mục đích tham chiếu, phân loại và quản lý nội bộ. Không sử dụng dự án này để mạo nhận thương hiệu chính thức.

Các tên thần thoại như Zeus, Hades, Odin, Thor, Loki, Anubis, Shiva, Buddha và các tên tương tự là tên thuộc thần thoại, tôn giáo, văn hóa dân gian hoặc tư liệu công cộng. Cách mô tả trong dự án được viết ngắn gọn lại để phục vụ việc đặt tên hội/game.

## Nguồn tham khảo nội dung tên

Nguồn tham khảo tổng quan cho tên thần thoại và nhân vật:

- Theoi Greek Mythology: https://www.theoi.com/
- Encyclopaedia Britannica: https://www.britannica.com/
- Wikipedia Mythology overview: https://en.wikipedia.org/wiki/Mythology
- Norse Mythology overview: https://en.wikipedia.org/wiki/Norse_mythology
- Greek Mythology overview: https://en.wikipedia.org/wiki/Greek_mythology
- Hindu Mythology overview: https://en.wikipedia.org/wiki/Hindu_mythology
- Egyptian Mythology overview: https://en.wikipedia.org/wiki/Egyptian_mythology
- Record of Ragnarok Wiki: https://record-of-ragnarok.fandom.com/wiki/Shuumatsu_no_Valkyrie:_Record_of_Ragnarok_Wiki

Nội dung trong source không sao chép nguyên văn từ các nguồn trên; mô tả đã được rút gọn và biên tập lại bằng tiếng Việt.
