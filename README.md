# Leadership Dashboard

This project is a React + TypeScript + Vite based dashboard for visualizing and evaluating leadership principles and performance.

## 주요 파일
- `src/leadership-dashboard-prototype.tsx`: 대시보드의 메인 컴포넌트입니다.
- `src/App.tsx`: 대시보드 컴포넌트를 앱의 루트로 사용합니다.

## 실행 방법
1. 의존성 설치: `npm install`
2. 개발 서버 실행: `npm run dev`
3. 브라우저에서 안내된 로컬 주소로 접속하여 대시보드를 확인할 수 있습니다.

## 기타
- UI는 Tailwind CSS 유틸리티 클래스 기반으로 작성되어 있습니다. 필요시 Tailwind CSS를 추가로 설치해 활용할 수 있습니다.

---

This project was bootstrapped with Vite and customized for a leadership dashboard prototype.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
