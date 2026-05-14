# Frontend uchun API dokumentatsiya

**Base URL:** `https://xodiyev-payment.sultonbayev.uz`

---

## Umumiy tushuncha

Vebinar 3 kun davom etadi. Har kuni ikkita o'yin bo'ladi:

| O'yin | Kimlar qatnashadi | Endpoint |
|---|---|---|
| **Planşet o'yini** | To'lov screenshoti yoki PDF yuklagan userlar | `/api/tablet/random-user` |
| **Voucher o'yini** | Faqat ism va telefon raqam qoldirgan barcha userlar | `/api/voucher/random-user` |

---

## 1. Planşet o'yini

### `GET /api/tablet/random-user`

To'lov fayli yuklagan userlar orasidan tasodifiy bitta g'olibni qaytaradi.

**Muvaffaqiyatli javob — `200 OK`:**
```json
{
  "fullName": "Sardor Xolmatov",
  "phoneNumber": "+998901234567",
  "files": [
    {
      "path": "uploads/123456789_1715000000000_photo.jpg",
      "type": "photo",
      "uploadedAt": "2026-05-13T18:00:00.000Z"
    },
    {
      "path": "uploads/123456789_1715000001000_check.pdf",
      "type": "document",
      "uploadedAt": "2026-05-13T19:00:00.000Z"
    }
  ]
}
```

**Hech kim yo'q — `404 Not Found`:**
```json
{
  "message": "Bugun hali hech kim to'lov qilmagan."
}
```

**Faylni ko'rsatish:**

`files` massividagi `path` qiymatini Base URL ga qo'shib ishlatiladi:

```
https://xodiyev-payment.sultonbayev.uz/uploads/123456789_1715000000000_photo.jpg
```

- `type: "photo"` → rasmni `<img>` teg orqali ko'rsating
- `type: "document"` → PDF yuklab olish uchun `<a href="...">` linki qo'ying

---

## 2. Voucher o'yini

### `GET /api/voucher/random-user`

Ism va telefon raqam qoldirgan barcha userlar orasidan tasodifiy bitta g'olibni qaytaradi.

**Muvaffaqiyatli javob — `200 OK`:**
```json
{
  "fullName": "Malika Yusupova",
  "phoneNumber": "+998991234567",
  "files": [
    {
      "path": "uploads/987654321_1715000000000_photo.jpg",
      "type": "photo",
      "uploadedAt": "2026-05-13T17:00:00.000Z"
    }
  ]
}
```

> `files` — agar user fayl yuklagan bo'lsa to'ldiriladi, yuklmagan bo'lsa `null` keladi.

**Hech kim yo'q — `404 Not Found`:**
```json
{
  "message": "Hali hech kim ro'yxatdan o'tmagan."
}
```

---

## O'yin logikasi (frontend qanday ishlashi kerak)

```
1. "G'olibni tanlash" tugmasi bosiladi
       ↓
2. GET /api/tablet/random-user  (yoki /api/voucher/random-user)
       ↓
3a. 200 → animatsiya bilan g'olib kartasini ko'rsatish
3b. 404 → "Hali ishtirokchilar yo'q" xabari
       ↓
4. G'olib ma'lumotlari: fullName, phoneNumber, files
       ↓
5. "Qayta o'ynash" tugmasi → 1-bosqichga qaytish
```

---

## Muhim eslatmalar

- Har bir so'rovda **boshqa** tasodifiy user kelishi mumkin — backend har safar qayta random tanlaydi
- Bir user bir nechta fayl yuklagan bo'lishi mumkin — `files` massiv bo'lib keladi
- CORS ochiq, istalgan domendan so'rov yuborish mumkin
