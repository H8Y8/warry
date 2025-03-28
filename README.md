# 電子產品保固記錄服務

## 待辦事項

1. 逐個測試所有功能：
   - **用戶認證功能**：
     - 註冊新用戶
     - 用戶登入
     - 忘記密碼流程
     - 重設密碼
     - 獲取用戶信息
   - **產品管理功能**：
     - 查看產品列表
     - 查看產品詳情
     - 添加新產品
     - 編輯現有產品
     - 刪除產品
     - 上傳產品圖片
     - 上傳保固文件和收據
   - **保固追踪功能**：
     - 儀表板顯示保固期限統計
     - 查看即將到期的保固
     - 查看已過期的保固
   - **保固提醒功能**：
     - 瀏覽保固提醒列表
     - 過濾提醒（全部/即將到期/已過期/有效）
     - 標記提醒為已讀
     - 電子郵件提醒設置
   - **AI產品識別功能**：
     - 上傳產品圖片
     - AI自動識別產品信息
     - 確認和修改識別結果
   - **用戶設定功能**：
     - 查看個人資料
     - 更新個人資料
     - 更改密碼
     - 設置提醒偏好

一個全功能的電子產品保固記錄系統，幫助用戶追踪和管理產品保固期限，包含AI產品識別功能，提供Web、平板和手機多平台支持。

## 功能特點

- 用戶認證：註冊、登入、密碼重置
- 產品管理：添加、編輯、刪除產品及保固資訊
- 保固追踪：儀表板顯示即將到期的保固
- 保固提醒：自動電子郵件提醒即將到期的保固
- AI圖片分析：通過上傳產品圖片自動識別產品信息
- 響應式設計：適配桌面、平板和手機設備

## 技術棧

### 前端
- React.js：UI框架
- React Router：前端路由
- Context API/Redux：狀態管理
- Axios：API請求
- Tailwind CSS：UI樣式
- Font Awesome：圖標

### 後端
- Node.js：運行環境
- Express：Web框架
- MongoDB：資料庫
- Mongoose：MongoDB ODM
- JWT：用戶認證
- Multer：文件上傳
- Nodemailer：郵件發送

### 其他
- RESTful API架構
- 響應式設計
- AI分析服務集成

## 資料庫設計

### 用戶集合(Users)
```json
{
  "_id": "ObjectId",
  "username": "String",
  "email": "String",
  "password": "String (hashed)",
  "fullName": "String",
  "profilePicture": "String (URL)",
  "settings": {
    "emailNotifications": "Boolean",
    "reminderDays": "Number"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 產品集合(Products)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "name": "String",
  "description": "String",
  "type": "String",
  "brand": "String",
  "model": "String",
  "serialNumber": "String",
  "purchaseDate": "Date",
  "warrantyEndDate": "Date",
  "images": ["String (URLs)"],
  "receipts": ["String (URLs)"],
  "warrantyDocuments": ["String (URLs)"],
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 提醒集合(Reminders)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "productId": "ObjectId (ref: Products)",
  "reminderDate": "Date",
  "isRead": "Boolean",
  "isSent": "Boolean",
  "sentAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## API 規劃

### 認證 API
- POST /api/auth/register - 註冊新用戶
- POST /api/auth/login - 用戶登入
- POST /api/auth/forgot-password - 忘記密碼
- POST /api/auth/reset-password - 重設密碼
- GET /api/auth/me - 獲取當前用戶信息

### 用戶 API
- GET /api/users/profile - 獲取用戶資料
- PUT /api/users/profile - 更新用戶資料
- PUT /api/users/password - 更改密碼
- PUT /api/users/settings - 更新用戶設置

### 產品 API
- GET /api/products - 獲取所有產品
- GET /api/products/:id - 獲取單個產品
- POST /api/products - 添加新產品
- PUT /api/products/:id - 更新產品
- DELETE /api/products/:id - 刪除產品
- POST /api/products/:id/upload - 上傳產品圖片/文件

### 保固提醒 API
- GET /api/reminders - 獲取所有提醒
- PUT /api/reminders/:id/read - 標記提醒為已讀
- POST /api/reminders/settings - 更新提醒設置

### AI分析 API
- POST /api/ai/analyze - 分析產品圖片

## 部署流程

### 開發環境設置
1. 克隆儲存庫
2. 安裝前端依賴：
   ```
   cd client
   npm install
   ```
3. 安裝後端依賴：
   ```
   cd server
   npm install
   ```
4. 配置環境變數：
   - 複製 `.env.example` 到 `.env`
   - 設置 MongoDB 連接字串
   - 設置 JWT 密鑰
   - 設置郵件服務賬戶
   - 設置AI服務API密鑰
5. 啟動後端：
   ```
   cd server
   npm run dev
   ```
6. 啟動前端：
   ```
   cd client
   npm start
   ```

### 生產環境部署
1. 前端打包：
   ```
   cd client
   npm run build
   ```
2. 後端打包：
   ```
   cd server
   npm run build
   ```
3. 部署選項：
   - 傳統托管：Nginx + PM2
   - Docker容器化
   - 雲服務部署：AWS, Heroku, Vercel, Netlify等

## 已知問題
- AI產品圖片分析上未實裝-3/15
- 新用戶註冊加入郵件驗證
- 單一登入 (SSO) 功能
- 忘記密碼功能
- 管理面板安全設計
- 社交分享功能(美觀截圖模式)排版待調整-3/29
- 暗黑模式
- 保固日曆頁面暫時移除（待優化）-3/20

## 已解決問題
1. 添加產品時上傳圖片失敗 -3/13
2. 產品列表縮圖路徑錯誤，應指向 server/uploads 目錄-3/13
3. 產品列表點進產品卡片的連結錯誤，未進入該產品-3/14
4. 產品相關文件上傳功能未實現-3/14
5. 產品列表的搜尋功能未實現-3/14
6. 儀表板尚未改成真實資料-3/15
7. 個人設置尚未改成真實資料-3/15
8. 登入頁面輸入錯誤沒有提示反應給使用者知道-3/16
9. 保固提醒尚未改成真實資料-3/15
10. 更改密碼功能未完成（無法驗證原密碼）-3/16

## 後續開發計劃
- **註冊帳號與驗證**
  - 新用戶註冊流程
  - **加入郵件驗證：** 用戶註冊後發送驗證信，點擊連結完成郵件驗證

- **單一登入 (SSO) 功能**
  - 使用 OAuth2/OpenID Connect 整合第三方身份提供者（如 Google、Facebook、GitHub 等）
  - 透過 Passport.js 或類似套件實作 SSO 流程

- **管理面板安全設計**
  - **JWT 驗證與 RBAC：** 僅限擁有 `role: "admin"` 的用戶存取管理介面
  - **IP 限制：** 僅允許特定授權的 IP 存取管理面板
  - **雙重驗證 (2FA)：** 登入時加入 Google Authenticator 等 2FA 驗證
  - **CSRF 與 CORS 防護：** 確保 API 僅接受合法來源的請求，防範跨站請求偽造攻擊

- **忘記密碼功能**
  - 用戶提交電子郵件後生成密碼重置 Token，並發送重置連結郵件
  - 使用 SendGrid（或其他郵件 API）搭配 Nodemailer 或官方模組進行郵件發送
  - 在 Cloudflare DNS 中設定 TXT、CNAME、SPF、DKIM 與 DMARC 紀錄，確保郵件信譽與到達率
- 社交分享功能
- 多語言支持
- 暗黑模式
- 產品統計分析
- 移動應用(React Native)

## 許可證
MIT 