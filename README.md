# 김희서 포트폴리오

공간정보공학을 공부하는 김희서의 자기소개 웹사이트입니다. 외부 라이브러리 없이 HTML, CSS, JavaScript로 만들었습니다.

## 프로젝트 정보

- GitHub 계정: [heeseo0616](https://github.com/heeseo0616)
- GitHub 저장소 URL: https://github.com/heeseo0616/heeseo-portfolio
- 배포 URL: https://heeseo0616.github.io/heeseo-portfolio/ (현재 배포 준비 중)
- 제작: 사용자 요청으로 AI가 코드와 문서 초안을 작성했습니다. 사용자 본인의 독자 구현·학습 이해·제출 완료를 의미하지 않습니다.

## 실행

VS Code에서 이 `portfolio` 폴더를 열고 Live Server 확장 기능을 설치한 뒤 `index.html`에서 **Open with Live Server**를 선택합니다. 프레임워크 설치와 빌드 과정은 없습니다.

Python이 있으면 이 폴더에서 `python -m http.server 8765`를 실행한 뒤 `http://localhost:8765`로 접속해도 됩니다. 직접 파일을 여는 방식보다 HTTP 서버 사용을 권장합니다.

## 파일 구조

```text
portfolio/
├── index.html
├── css/style.css
├── js/config.js
├── js/main.js
├── images/profile.svg
├── images/desktop.jpg
├── images/mobile.jpg
├── images/dark.jpg
├── tests/check.mjs
├── README.md
└── 구현설명.md
```

`images/profile.svg`는 이름만 적힌 간단한 프로필 이미지입니다. 실제 사진으로 교체할 경우 HTML의 이미지 경로와 alt도 함께 바꿉니다. 학번·개인 이메일은 공개 페이지에 넣지 않았습니다.

2026-10-30 사용자 요청으로 지도 그림·영어 장식 문구·큰 여백·색상 강조를 제거하고, 기본 글꼴의 흰 화면에 섹션을 순서대로 배치했습니다. 과제 필수 기능인 반응형, 다크 모드, 스크롤 기능과 최소한의 hover/전환/그림자는 유지했습니다.

## 구현 기능

- Hero, About, Skills, Projects, Contact, Footer와 시맨틱 태그
- 모바일 퍼스트, 768px 태블릿·1024px 데스크톱 분기
- Flexbox 네비게이션, `auto-fit` / `minmax` Grid 프로젝트 카드
- 다크 모드와 localStorage 유지, 처음 방문 시 시스템 테마 감지
- 모바일 햄버거 메뉴, Escape·외부 클릭·섹션 이동 시 닫기
- 부드러운 스크롤, **60px 이상**에서 헤더 배경 변경, **300px 이상**에서 맨 위 버튼 표시
- Intersection Observer 애니메이션: **threshold 0.2**, 한 번 표시한 요소는 관찰 해제
- 모션 감소 설정 시 부드러운 스크롤과 애니메이션 생략
- GitHub API 로딩·성공·에러·빈 목록과 재시도, **12초** 요청 시간 제한
- 최신 업데이트 순 최대 **100개** 본인 소유 공개 저장소
- 언어 필터(선택 기능), 설명 없는 저장소와 언어 없는 저장소 대응
- 필수값·공백·이메일 검사, 필드 근처 오류, 첫 오류 필드로 초점 이동
- 문의 폼은 입력 확인만 수행하며 전송·서버 저장·localStorage 저장하지 않음
- 키보드 초점 표시, 본문 바로가기, 이미지 alt, 연결된 label, aria-live 상태 안내
- API 외부 텍스트 HTML 이스케이프, GitHub 링크의 계정/저장소 이름 URL 인코딩

## 계정 설정

`js/config.js`의 `githubUsername`을 변경하면 API와 GitHub 링크가 함께 바뀝니다. 현재는 `heeseo0616`입니다. API 인증 토큰은 필요하지 않으며 코드에 비밀 정보를 넣지 않습니다.

GitHub는 인증 없는 API 요청에 사용량 제한을 적용합니다. 과제 원문 기준 시간당 60회이며, 자주 새로고침하지 않는 것이 좋습니다. 403·429는 제한/접근 오류 메시지와 재시도 버튼으로 처리합니다. 공개 저장소가 없으면 빈 상태를 표시합니다.

## GitHub Pages 배포

1. GitHub에서 새 공개 저장소(예: `heeseo-portfolio`)를 만듭니다.
2. 이 폴더 **안의 파일들**을 저장소 최상위에 업로드합니다. `index.html`이 저장소 바로 아래에 있어야 합니다. 기록.md 등 상위 참고 자료는 올리지 않습니다.
3. 저장소 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**를 선택합니다.
4. 브랜치를 `main`, 폴더를 `/(root)`로 선택하고 저장합니다.
5. 배포 완료 후 GitHub에 표시되는 실제 URL을 열고, README의 저장소 URL·배포 URL을 갱신합니다.
6. 실제 배포 사이트에서 데스크톱·모바일·다크 모드 스크린샷을 찍어 추가합니다.

예상 주소 형식은 `https://heeseo0616.github.io/heeseo-portfolio/`입니다. **현재 배포된 주소가 아닙니다.** 계정 로그인과 저장소 업로드/배포가 완료되어야 생깁니다.

공식 안내: [GitHub Pages 게시 원본 구성](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [GitHub 저장소 REST API](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user)

## 검증

자동 검사: `node tests/check.mjs`. DOM 대역과 가짜 API 응답으로 상태 변경·폼 검증·API 오류 처리·외부 텍스트 이스케이프를 검사합니다. 실제 브라우저의 시각적 배치나 네트워크 성공을 보증하는 검사는 아닙니다.

실제 브라우저에서는 다음을 확인합니다.

- 375px, 768px, 1024px, 1440px에서 가로 넘침 없이 표시되는가
- 햄버거 메뉴와 앵커 이동이 동작하고 키보드로 사용할 수 있는가
- 다크 모드를 바꾸고 새로고침해도 유지되는가
- 실제 GitHub 저장소가 표시되고 언어 필터가 작동하는가
- 오프라인에서 오류·재시도가, 저장소가 없는 응답에서 빈 상태가 표시되는가
- 빈 입력·공백·잘못된 이메일을 막고, 올바른 입력 시 전송하지 않았음을 안내하는가
- 60px·300px 스크롤 조건과 화면 진입 애니메이션이 동작하는가

## 확인한 결과와 스크린샷

2026-10-26 로컬 HTTP 서버에서 실제 브라우저로 확인했습니다. 공개 저장소 4개 표시, Python 필터 적용 시 2개 표시, 다크 모드 전환 후 새로고침 유지, 모바일 메뉴 열기/섹션 이동 시 닫기, 빈 폼·잘못된 이메일 차단과 정상 입력 확인 메시지를 검증했습니다. 375·768·1024·1440px에서 가로 넘침이 없음을 확인했습니다. 자동 상태 검사 23개와 JavaScript 구문 검사도 통과했습니다.

아래는 **로컬 미리보기**에서 촬영한 스크린샷입니다. 아직 GitHub Pages 배포 결과는 아닙니다. 배포 후 실제 URL에서 다시 확인해야 합니다.

2026-10-30 단순 배치로 변경한 뒤 자동 검사 23개·구문 검사를 다시 통과했습니다. 실제 브라우저에서 새 배치, 저장소 4개 표시, 다크 모드 전환, 모바일 메뉴 열기/닫기와 375px 가로 넘침 없음을 확인했습니다. 아래 이미지는 변경한 버전이며, 기존 desktop.jpg/mobile.jpg/dark.jpg는 이전 디자인의 기록입니다.

![데스크톱](images/simple-desktop.jpg)
![모바일](images/simple-mobile.jpg)
![다크 모드](images/simple-dark.jpg)

GitHub 저장소 생성 페이지를 열었으나 로그인 화면으로 이동했습니다. 연결된 브라우저의 로그인이 필요하여 저장소 생성·업로드·배포는 수행하지 않았습니다.
