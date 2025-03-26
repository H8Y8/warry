const express = require('express');
const router = express.Router();
const axios = require('axios');

// OpenRouter API 代理路由
router.post('/joke', async (req, res) => {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o-mini',
      messages: [{
        role: 'user',
        content: '你是一個專幽默的電子產品專家，現在講個冷知識，在30個字以內，務必保證是冷知識，直接說冷知識就好，不要說其他任何的話，也不要反問使用者任何問題，也不需要解釋，用中文回答，從「你知道嗎？」開始'
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'WARRY Warranty Manager',
        'OR-Organization': 'personal',
        'temperature': 2
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('OpenRouter API 錯誤:', error.response?.data || error.message);
    res.status(500).json({ error: '獲取笑話失敗' });
  }
});

module.exports = router;

// ... existing routes ... 