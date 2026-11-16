/* =====================================================
   CNUtour main.js (회원가입 / 로그인 / 마이페이지 / 지도 / 퀴즈 / 뱃지 / 캐릭터 이동)
===================================================== */


/* ===========================
      🟢 회원가입 처리
=========================== */
async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const nickname = document.getElementById("nickname").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const char = document.querySelector('input[name="char"]:checked');

  if (!name || !nickname || !email || !password) {
    alert("모든 정보를 입력해주세요!");
    return;
  }
  if (!char) {
    alert("캐릭터를 선택해주세요!");
    return;
  }

  const newUser = {
    name,
    nickname,
    email,
    password,
    character: char.value,
    level: 1,
    exp: 0,
    solvedQuizzes: [],
    visitedBuildings: [],
    badges: [],
    playerX: 77.3,
    playerY: 82.5
  };

  try {
    const response = await fetch("php/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
      cache: "no-store"
    });

    const result = await response.json();

    if (result.success) {
      alert("회원가입 완료! 로그인 페이지로 이동합니다.");
      window.location.href = "login.html";
    } else {
      alert(result.message || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("회원가입 오류:", error);
    alert("서버와의 통신에 실패했습니다.");
  }
}


/* ===========================
      🟢 로그인 처리
=========================== */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("php/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store"
    });

    const result = await response.json();

    if (result.success) {
      // sessionStorage에 현재 사용자 저장
      sessionStorage.setItem("currentUser", JSON.stringify(result.user));
      alert(`${result.user.nickname}님 환영합니다!`);
      window.location.href = "index.html";
    } else {
      if (result.message === "등록된 계정이 없습니다.") {
        alert("등록된 계정이 없습니다.");
        window.location.href = "signup.html";
      } else {
        alert(result.message || "로그인에 실패했습니다.");
      }
    }
  } catch (error) {
    console.error("로그인 오류:", error);
    alert("서버와의 통신에 실패했습니다.");
  }
}


/* ===========================
    🟢 로그인 검증 + 로그아웃
=========================== */
function requireLogin() {
  if (!sessionStorage.getItem("currentUser")) {
    alert("로그인이 필요합니다");
    window.location.href = "login.html";
  }
}

function handleLogout(event) {
  event.preventDefault();
  sessionStorage.removeItem("currentUser");
  alert("로그아웃 되었습니다.");
  window.location.href = "login.html";
}


/* ===========================
      🟢 마이페이지
=========================== */
async function loadMyPage() {
  requireLogin();

  let user = JSON.parse(sessionStorage.getItem("currentUser"));

  // 서버에서 최신 데이터 불러오기
  try {
    const response = await fetch("php/loadUserData.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
      cache: "no-store"
    });

    const result = await response.json();

    if (result.success) {
      user = result.user;
      // sessionStorage 업데이트
      sessionStorage.setItem("currentUser", JSON.stringify(user));
    }
  } catch (error) {
    console.error("마이페이지 데이터 로드 오류:", error);
  }

  // 닉네임, 캐릭터
  const nickEl = document.querySelector(".nickname");
  const charEl = document.querySelector(".profile-character");
  const levelText = document.getElementById("level-number");
  const levelFill = document.querySelector(".level-fill");
  const expText = document.querySelector(".exp-text");
  const badgeList = document.getElementById("badge-list");

  if (nickEl) nickEl.innerText = `닉네임: ${user.nickname}`;
  if (charEl) charEl.src = `images/char${user.character}.png`;

  // 레벨 / 경험치
  const exp = user.exp || 0;
  const level = user.level || 1;
  if (levelText) levelText.innerText = level;
  if (levelFill) levelFill.style.width = `${Math.min(exp, 100)}%`;
  if (expText) expText.innerText = `경험치: ${exp} / 100`;

  // 뱃지
  if (badgeList) {
    badgeList.innerHTML = "";
    const badges = user.badges || [];

    if (badges.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "아직 획득한 뱃지가 없습니다. 캠퍼스를 돌아다니며 퀴즈를 풀어보세요!";
      empty.className = "badge-empty";
      badgeList.appendChild(empty);
    } else {
      badges.forEach(badge => {
        const item = document.createElement("div");
        item.className = "badge-item";
        item.textContent = badge;
        badgeList.appendChild(item);
      });
    }
  }
}


/* =====================================================
        🟢 건물 정보 / 이미지 / 퀴즈 데이터
===================================================== */

const buildingData = {
  "수의과대학": {
    desc: "수의과 학생들이 사용하는 건물입니다.",
    img: "images/animal.png",
    quiz: null
  },

  "생활과학대학": {
    desc: "생활과학대학 학생들이 사용하는 건물입니다.",
    img: "images/lifescience.png",
    quiz: null
  },

  "생명시스템과학대학": {
    desc: "생명시스템과학대학 학생들이 사용하는 건물입니다.",
    img: "images/lifesystemscience.png",
    quiz: null
  },

  "테니스장 1": {
    desc: "테니스를 칠 수 있는 공간입니다. 예약 후 이용해야합니다.",
    img: "images/tennis.png",
    quiz: {
      question: "충남대의 테니스 동아리 이름은?",
      options: ["굿샷", "통통", "라켓", "스트링"],
      answer: "굿샷"
    }
  },

  "테니스장 2": {
    desc: "또 다른 테니스장입니다. 예약 후 이용해야합니다.",
    img: "images/tennis.png",
    quiz: null
  },

  "축구장": {
    desc: "축구를 할 수 있는 공간입니다. ",
    img: "images/soccer.png",
    quiz: {
      question: "충남대에는 축구 동아리가 있다 없다?",
      options: ["O", "x"],
      answer: "O"
    }
  },

  "풋살장": {
    desc: "풋살을 할 수 있는 공간입니다. 축구장 옆에 붙어있습니다.",
    img: null,
    quiz: null
  },

  "북부운동장": {
    desc: "학교의 북쪽에 있는 운동장입니다. 체육대회 등이 진행됩니다.",
    img: "images/northplayground.png",
    quiz: null
  },

  "실내체육관": {
    desc: "배드민턴,농구,배구 등을 할 수 있는 체육관",
    img: "images/indoorgym.png",
    quiz: null
  },

  "서문": {
    desc: "학교의 서문입니다.",
    img: "images/westdoor.png",
    quiz: {
      question: "서문과 맞닿아있는 동네 이름",
      options: ["궁동", "신궁동", "봉명동", "죽동"],
      answer: "죽동"
    }
  },

  "사범대학": {
    desc: "사범대학 학생들이 사용하는 건물입니다.",
    img: "images/teach.png",
    quiz: null,
  },

  "공동실험실습관": {
    desc: "각종 첨단 실험실습기기를 공동 활용하고 관리하며 학생 실험, 실습교육지원과 이공계 교수연구의 시료분석 및 공동기기지원을 하는 건물",
    img: "images/w9.jpg",
    quiz: null,
  },

  "백마교양교육관": {
    desc: "교양 과목을 듣는 건물. 보통 3층 연결다리로 출입한다.",
    img: "images/w10.png",
    quiz: {
      question: "교양관에는 여학우 휴게실이 있다? 없다?",
      options: ["O", "X"],
      answer: "O"
    }
  },

  "자연과학대학 4호관": {
    desc: "자연대 학생들이 사용하는 건물이다. 대표적인 과로는 천문우주과학과가 있다.",
    img: "images/w11-2.webp",
    quiz: null,
  },

  "자연과학대학 3호관": {
    desc: "자연대 학생들이 사용하는 건물이다. 대표적인 과로는 화학과가 있다.",
    img: "images/w11-1.png",
    quiz: null,
  },

  "법학전문대학원": {
    desc: "충남대학교 로스쿨로 대한민국의 25개 공인 로스쿨 중 하나이다.",
    img: "images/law.jpg",
    quiz: {
      question: "충남대학교에는 법학과(대학원x)가 있다?",
      options: ["O", "X"],
      answer: "X"
    }
  },

  "기숙사↔법대 지름길": {
    desc: "기숙사와 법대를 편하게 이동할 수 있는 길이다. 산을 돌아가야하는 길을 계단을 통해 산을 넘어갈 수 있다. 두 건물 다 산 정상에 위치한 만큼 법전원에 다니는 사람들은 기숙사를 이용하는 경우가 많다.",
    img: "images/law-dormitory.png",
    quiz: null
  },

  "음대 2호관": {
    desc: "음대 학생들이 이용하는 건물이다. 대표적인 과로 작곡과가 있다.",
    img: "images/music2.jpg",
    quiz: null
  },

  "음대 1호관": {
    desc: "음대 학생들이 이용하는 건물이다. 대표적인 과로 음악과가 있다.",
    img: "images/music1.png",
    quiz: null
  },

  "오케스트라홀": {
    desc: "오케스트라 공연이 열리는 건물이다. 음대 학생들의 졸업 공연 때 이용되기도 한다.",
    img: "images/ochestra.png",
    quiz: {
      question: "오케스트라홀은 어떤 건물 아래에 있을까?",
      options: ["음대 2호관", "음대 1호관", "예술대 디자인관"],
      answer: "음대 1호관"
    }
  },

  "예술대 디자인관": {
    desc: "예술대 디자인과 학생들이 사용하는 건물이다. 졸업 전시를 진행하기도 하고, 졸업생의 전시를 진행하기도 한다.",
    img: "images/design.jpg",
    quiz: null
  },

  "예술대 미술관": {
    desc: "예술대 미술과 학생들이 사용하는 건물이다. 졸업 전시를 진행하기도 하고, 졸업생의 전시를 진행하기도 한다.",
    img: "images/art.png",
    quiz: null
  },

  "제3학생회관": {
    desc: "헬스장, 학생/교직원 식당, 카페 등 학생들을 위한 편의시설이 있는 건물이다. 기숙사에 거주하는 학생들이 주로 이용한다.",
    img: "images/student3.png",
    quiz: {
      question: "헬스장은 몇 층일까?",
      options: ["지하실", "1층", "2층", "3층"],
      answer: "지하실"
    }
  },

  "도서관": {
    desc: "학생들이 공부할 수 있는 공간이다. 층마다 다양한 공간이 있어서 다양한 공부 환경을 조성할 수 있다.",
    img: "images/library.png",
    quiz: {
      question: "충남대 도서관은 외부인 출입이 가능할까?",
      options: ["O", "X"],
      answer: "O"
    }
  },

  "자연과학대학 2호관": {
    desc: "자연대 학생들이 사용하는 건물이다. 대표적인 과로 수학과가 있다.",
    img: "images/w4.jpg",
    quiz: null
  },
  
  "자연과학대학 1호관": {
    desc: "자연대 학생들이 사용하는 건물이다. 대표적인 과로 무용학과가 있다.",
    img: "images/w5.png",
    quiz: null
  },

  "약학대학": {
    desc: "약학과 학생들이 사용하는 건물이다. 건물의 3층에는 자연대 1호관과 연결되는 다리가 있다.",
    img: "images/medicine.png",
    quiz: null
  },

  "막동": {
    desc: "막걸리 동산을 줄여서 막동이라고 부른다. 봄, 가을처럼 날이 좋을 때는 돗자리를 펴고 여기서 음식을 먹거나 술을 마시는 풍경을 자주 볼 수 있다.",
    img:"images/alcohol.png",
    quiz: {
      question: "막동의 원래 이름은 무엇일까?",
      options: ["막걸리 동산", "조각공원", "동산"],
      answer: "조각공원"
    }
  },

  "영탑지": {
    desc: "막동가는 길에 위치한 충대석탑과 작은 연못이 있는 곳이다. 연못에는 물고기도 있다. 이 곳의 이름을 딴 영탑 카페도 1학에 위치해있다.",
    img:"images/youngtop.png",
    quiz: {
      question: "충대석탑은 어떤 탑을 본 떠 만든걸까?",
      options: ["미륵사지 석탑", "석가탑", "정림사지 5층 석탑", "다보탑"],
      answer: "정림사지 5층 석탑"
    }
  },

  "인문대학": {
    desc: "인문대학 학생들이 이용하는 건물이다. 교양관과 아주 가깝다.",
    img: "images/w7.png",
    quiz: null
  },

  "제1학생회관": {
    desc: "학생식당, 카페, 문구점 등이 위치한 건물이다.",
    img: "images/student1.png",
    quiz: {
      question: "제1학생회관에 없는 것은?",
      options: ["안경점", "여행사", "하나은행", "휴대폰 수리점"],
      answer: "휴대폰 수리점"
    }
  },

  "한누리회관": {
    desc: "주로 동아리실로 이용되며, 우체국, 헌혈의 집 등이 위치해있다.",
    img: "images/hannuri.png",
    quiz: null
  },

  "공과대학 1호관": {
    desc: "공과대학 학생들이 이용하는 건물이다. 대표적인 과로 유기재료공학과가 있다.",
    img: "images/gong1.jpg",
    quiz: null
  },
  
  "공과대학 5호관": {
    desc: "공과대학 학생들이 이용하는 건물이다. 컴퓨터융합학부와 인공지능학과 학생들이 이용한다.",
    img: "images/gong5.png",
    quiz: {
      question: "공과대학 5호관의 건물 번호는?",
      options: ["w1", "w2", "w3", "w4", "w5"],
      answer: "w2"
    }
  },

  "공5 지름길": {
    desc: "공과대학 5호관의 3층 끝에 있는 길입니다. 이 길을 통해 사회과학대학, 교양대를 편하게 갈 수 있습니다.",
    img: "images/shortcut.png",
    quiz: null
  },

  "사회과학대학 강의동": {
    desc: "사회과학대학 학생들이 사용하는 건물이다. 소규모 강당인 하누리 강당과 많은 강의실이 있다.",
    img: "images/w12-2.png",
    quiz: null
  },

  "사회과학대학": {
    desc: "사회과학대학 학생들이 사용하는 건물이다.",
    img: "images/w12-1.png",
    quiz: null
  },

  "산학연교육연구관": {
    desc: "다양한 기업들과 사업단들이 있는 건물이다. 에너지공학과가 사용하기도 한다.",
    img: "images/w1.png",
    quiz: null
  },

  "노천극장": {
    desc: "동아리의 무대 혹은 축제가 진행되는 장소이다.",
    img: "images/nocheon.png",
    quiz: {
      question: "노천극장에서 진행하는 축제 이름은?",
      options: ["해오름제", "대동체", "엔지니어링페어"],
      answer: "해오름제"
    }
  },

  "남부운동장": {
    desc: "정문에서 가장 가까운 운동장이다. 여기서 단과대 체육대회, 대동제 등이 진행된다. 옆에는 작은 농구장도 있다.",
    img: "images/southground.png",
    quiz: null
  },

  "약초원 관리동": {
    desc: "약초원 관리와 약초 수집, 관리, 보관에 이용되는 건물이다.",
    img: "images/w13.png",
    quiz: null
  },

  "굴다리 방향": {
    desc: "노천극장을 가로질러 학사마을로 갈 수 있는 지름길이다.",
    img: "images/guldari.png",
    quiz: null
  },

  "학생생활관": {
    desc: "충남대의 기숙사이다. 이인구 인재관과 1동부터 13동까지로 구성되어있다.",
    img: "images/dormitory.png",
    quiz: {
      question: "외부인이 사먹을 수 있는 기숙사식의 시간은?",
      options: ["아침", "점심", "저녁"],
      answer: "점심"
    }
  },

  "정보화본부": {
    desc: "수강신청 등 학교의 서버를 관리하는 건물이다.",
    img: "images/n2.png",
    quiz: null
  },

  "대학본부": {
    desc: "대학본부이다.",
    img: "images/e7.png",
    quiz: null
  },

  "대학본부 별관": {
    desc: "대학본부 별관이다. 주로 학생의 민원과 학사 관리는 여기서 처리한다. 증명서도 프린트할 수 있다.",
    img: "images/e7-1.png",
    quiz: null
  },

  "경상대학": {
    desc: "경상대학 학생들이 사용하는 건물이다. 대학본부 별관과 2학의 중간에 위치해있어 대학본부 별관에서 경상관을 통해 2학에 도착할 수 있다.",
    img: "images/e6.png",
    quiz: null
  },

  "백마상": {
    desc: "충남대의 상징 동물인 백마 동상이다. 경상대 옆에 세워져 있다.",
    img: "images/baekma.png",
    quiz: {
      question: "백마상의 상징은?",
      options: ["지성, 야망, 이상", "정의", "순수"],
      answer: "지성, 야망, 이상"
    }
  },

  "인재개발원": {
    desc: "주로 2학생회관이라고 불린다. 1층에는 학생 및 교직원 식당, 카페, 편의점이, 2층에는 취업 관련 행사 및 강연이 진행된다.",
    img: "images/e5.png",
    quiz: null
  },

  "공과대학 3호관": {
    desc: "공과대학 학생들이 이용하는 건물이다. 대표적인 과로는 정보통신공학과가 있다.",
    img: "images/gong3.png",
    quiz: null
  },

  "융합교육혁신센터": {
    desc: "다양한 행사 및 강연이 열리는 공간이다. 대표적으로 교수지원학습센터의 프로그램 최종 발표회가 매년 열린다.",
    img: "images/e5-1.png",
    quiz: null
  },

  "공과대학 4호관": {
    desc: "공과대학 학생들이 이용하는 건물이다. 대표적인 과로는 기계공학과가 있다.",
    img: "images/gong4.png",
    quiz: null
  },

  "공과대학 2호관": {
    desc: "공과대학 학생들이 이용하는 건물이다. 대표적인 과로는 건축학과가 있다. 궁동으로 가는 쪽문과 연결되어 있어서 궁동갈 때 자주 사용하는 건물이다.",
    img: "images/gong2.png",
    quiz: null
  },

  "정심화국제문화회관": {
    desc: "다양한 공연이 진행되는 공간이다. 입학식 및 행사들이 진행되기도 한다.",
    img: "images/e1-2.webp",
    quiz: {
      question: "정심화국제문화회관에서 공연할 때 사용하는 홀 이름은?",
      options: ["정심화홀", "취봉홀", "대덕홀"],
      answer: "정심화홀"
    }
  },

  "쪽문 (궁동가는 길)": {
    desc: "궁동과 바로 연결되는 길이다. 공과대학2호관을 통해서 나오면 빠르게 나올 수 있다.",
    img: "images/zzok.png",
    quiz: null
  },

  "파빌리온": {
    desc: "충남대학교 굿즈를 판매하는 건물이다. 과잠, 티셔츠, 차차인형 등을 구입할 수 있다.",
    img: "images/pavilion.png",
    quiz: null
  },

  "정문": {
    desc: "충남대학교 정문이다. 정문과 맞닿아있는 동네는 신궁동과 봉명동이다.",
    img: "images/main_gate.png",
    quiz: {
      question: "충남대의 정문은 서울의 어떤 학교의 정문과 닮았을까?",
      options: ["서울대", "고려대", "연세대"],
      answer: "서울대"
    }
  },

  "농업생명공학관": {
    desc: "농업생명과학 연구가 진행되는 건물이다.",
    img: "images/e8.png",
    quiz: null
  },

  "상록회관": {
    desc: "학생식당, 기계실, 카페, 학생회실, 농대 도서관 등이 위치해있는 건물이다. 4학이라고도 불린다.",
    img: "images/sangrok.jpg",
    quiz: {
      question: "어떤 학생회실이 위치해 있을까?",
      options: ["농대학생회", "공대학생회", "자연대학생회", "총학생회"],
      answer: "농대학생회"
    }
  },

  "농생대 2,3호관": {
    desc: "농생대 학생들이 이용하는 건물이다. 대표적인 과로 동물자원생명과학과가 있다.",
    img: "images/23.png",
    quiz: null
  },

  "농생대 1호관": {
    desc: "농생대 학생들이 이용하는 건물이다. 대표적인 과로 식물자원학과가 있다.",
    img: "images/1.png",
    quiz: null
  },

  "카이스트 가는 길": {
    desc: "충남대와 카이스트를 구분짓는 길이자 연결해주는 길이다. 이 길을 넘어가면 카이스트이다.",
    img: "images/tokaist.png",
    quiz: null
  },

  "농업과학기술센터": {
    desc: "학술지 발간, 연수지원, 국제교류, 학술대회, 센터운영 등을 하는 연구동이다.",
    img: "images/e12.png",
    quiz: null
  },
};


/* =====================================================
      🟢 서버 데이터 저장 공통 함수
===================================================== */

// 사용자 데이터를 서버에 저장하는 공통 함수
async function saveUserToServer(userData) {
  try {
    const response = await fetch("php/saveUserData.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      cache: "no-store"
    });

    const result = await response.json();

    if (result.success && result.user) {
      // sessionStorage 업데이트
      sessionStorage.setItem("currentUser", JSON.stringify(result.user));
      return result.user;
    }
    return userData; // 실패시 원본 반환
  } catch (error) {
    console.error("서버 저장 오류:", error);
    return userData; // 오류 시 원본 반환
  }
}

/* =====================================================
      🟢 퀴즈 풀이 기록 & 뱃지 시스템
===================================================== */

// 풀린 퀴즈 목록 가져오기
function getSolvedQuizzes() {
  let user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user.solvedQuizzes) {
    user.solvedQuizzes = [];
  }
  return user.solvedQuizzes;
}

// 방문한 건물 확인 함수
function getVisitedBuildings() {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user.visitedBuildings) {
    user.visitedBuildings = [];
  }
  return user.visitedBuildings;
}

// 건물 방문 기록 저장 (비동기)
async function markBuildingAsVisited(buildingName) {
  let user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user.visitedBuildings) {
    user.visitedBuildings = [];
  }
  if (!user.visitedBuildings.includes(buildingName)) {
    user.visitedBuildings.push(buildingName);
    // 서버에 저장
    await saveUserToServer(user);
  }
}

// 퀴즈 풀었다고 저장 (비동기)
async function markQuizAsSolved(buildingName) {
  let user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user.solvedQuizzes) {
    user.solvedQuizzes = [];
  }
  if (!user.solvedQuizzes.includes(buildingName)) {
    user.solvedQuizzes.push(buildingName);
    // 서버에 저장
    await saveUserToServer(user);
  }
}

// 뱃지 지급 로직 (퀴즈 개수 기준)
// 3개: 초심자 탐험가
// 6개: 중급 탐험가
// 10개: 상급 탐험가
// 14개: 마스터 탐험가
// 18개: 전설의 탐험가 (+ 축하 애니메이션)
async function checkBadgeReward() {
  let user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user.solvedQuizzes) user.solvedQuizzes = [];
  if (!user.badges) user.badges = [];

  const count = user.solvedQuizzes.length;
  let newBadge = null;

  if (count >= 18 && !user.badges.includes("🌟 전설의 탐험가")) {
    newBadge = "🌟 전설의 탐험가";
  } else if (count >= 14 && !user.badges.includes("🏆 마스터 탐험가")) {
    newBadge = "🏆 마스터 탐험가";
  } else if (count >= 10 && !user.badges.includes("🥇 상급 탐험가")) {
    newBadge = "🥇 상급 탐험가";
  } else if (count >= 6 && !user.badges.includes("🥈 중급 탐험가")) {
    newBadge = "🥈 중급 탐험가";
  } else if (count >= 3 && !user.badges.includes("🎖 초심자 탐험가")) {
    newBadge = "🎖 초심자 탐험가";
  }

  if (newBadge) {
    user.badges.push(newBadge);
    alert(`새로운 뱃지를 획득했습니다! \n${newBadge}`);
  }

  // 모든 퀴즈(18개)를 다 풀었을 때 1회 축하 애니메이션
  if (count === 18 && !user.fullClearCelebrated) {
    user.fullClearCelebrated = true;
    showFullClearCelebration();
  }

  // 서버에 저장
  await saveUserToServer(user);
}

// 전체 클리어 축하 애니메이션
function showFullClearCelebration() {
  // 이미 떠 있으면 중복 생성 방지
  if (document.querySelector(".full-clear-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "full-clear-overlay";
  overlay.innerHTML = `
    <div class="full-clear-message">
      <h2>🎉 모든 퀴즈를 완료했어요! 🎉</h2>
      <p>CNUtour 캠퍼스 마스터 달성! 🌟</p>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add("hide");
  }, 2500);

  setTimeout(() => {
    overlay.remove();
  }, 3500);
}


/* =====================================================
      🟢 플레이어 캐릭터 이동 시스템
===================================================== */

let playerX = 77.3; // 초기 위치 - 정문 (%)
let playerY = 82.5;
const moveSpeed = 2; // 이동 속도 (%)
const interactionDistance = 10; // 건물과 상호작용 가능한 거리 (%)

function initPlayer() {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const player = document.getElementById("player");
  
  // 사용자 캐릭터 이미지 설정
  player.src = `images/char${user.character}.png`;
  
  // 저장된 위치가 있으면 불러오기
  if (user.playerX !== undefined && user.playerY !== undefined) {
    playerX = user.playerX;
    playerY = user.playerY;
  }
  
  updatePlayerPosition();
  
  // 초기 로드 시 근처 건물 체크 및 방문 기록 표시
  setTimeout(() => {
    checkNearbyBuildings();
  }, 100);
}

function updatePlayerPosition() {
  const player = document.getElementById("player");
  player.style.left = `${playerX}%`;
  player.style.top = `${playerY}%`;
  player.style.transform = 'translate(-50%, -50%)'; // 중앙 정렬
  
  // 근처 건물 확인 및 하이라이트
  checkNearbyBuildings();
}

// 두 점 사이의 거리 계산
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 건물 위치 가져오기 (CSS에서 계산된 위치 사용)
function getBuildingPosition(element) {
  const computed = window.getComputedStyle(element);
  const top = parseFloat(computed.top);
  const left = parseFloat(computed.left);
  
  // 부모 요소의 크기 가져오기
  const parent = element.parentElement;
  const parentHeight = parent.offsetHeight;
  const parentWidth = parent.offsetWidth;
  
  // 픽셀 값을 퍼센트로 변환
  const topPercent = (top / parentHeight) * 100;
  const leftPercent = (left / parentWidth) * 100;
  
  return { x: leftPercent, y: topPercent };
}

// 근처 건물 확인 및 하이라이트 (가장 가까운 건물 하나만)
function checkNearbyBuildings() {
  let closestBuilding = null;
  let closestDistance = interactionDistance;
  
  const visitedBuildings = getVisitedBuildings();
  
  // 모든 건물 비활성화
  document.querySelectorAll('.building-label').forEach(label => {
    label.classList.remove('nearby');
    label.style.pointerEvents = 'none';
    
    // 방문한 건물 표시
    const buildingName = label.textContent.trim();
    if (visitedBuildings.includes(buildingName)) {
      label.classList.add('visited');
    } else {
      label.classList.remove('visited');
    }
  });
  
  // 가장 가까운 건물 찾기
  document.querySelectorAll('.building-label').forEach(label => {
    const pos = getBuildingPosition(label);
    const distance = getDistance(playerX, playerY, pos.x, pos.y);
    
    if (distance <= interactionDistance && distance < closestDistance) {
      closestDistance = distance;
      closestBuilding = label;
    }
  });
  
  // 가장 가까운 건물만 활성화
  if (closestBuilding) {
    closestBuilding.classList.add('nearby');
    closestBuilding.style.pointerEvents = 'auto';
    
    console.log(`🎯 활성화: ${closestBuilding.textContent.trim()}, 거리: ${closestDistance.toFixed(2)}%`);
  }
}

async function savePlayerPosition() {
  let user = JSON.parse(sessionStorage.getItem("currentUser"));
  user.playerX = playerX;
  user.playerY = playerY;
  
  // 서버에 저장 (백그라운드)
  saveUserToServer(user); // await 없이 비동기로 실행
}

// 방향에 따라 캐릭터 이동 (공통 함수)
function movePlayer(direction) {
  let moved = false;
  
  switch(direction) {
    case 'up':
      if (playerY > 5) {
        playerY -= moveSpeed;
        moved = true;
      }
      break;
    case 'down':
      if (playerY < 95) {
        playerY += moveSpeed;
        moved = true;
      }
      break;
    case 'left':
      if (playerX > 5) {
        playerX -= moveSpeed;
        moved = true;
      }
      break;
    case 'right':
      if (playerX < 95) {
        playerX += moveSpeed;
        moved = true;
      }
      break;
  }
  
  if (moved) {
    updatePlayerPosition();
    savePlayerPosition();
  }
}

function handleKeyPress(event) {
  const key = event.key;
  let direction = null;
  
  switch(key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      direction = 'up';
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      direction = 'down';
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      direction = 'left';
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      direction = 'right';
      break;
  }
  
  if (direction) {
    event.preventDefault(); // 방향키로 페이지 스크롤 방지
    movePlayer(direction);
  }
}


/* =====================================================
      🟢 경험치 증가 함수
===================================================== */

async function addExperience(amount, reason, showAlert = true) {
  let user = JSON.parse(sessionStorage.getItem("currentUser"));
  const oldLevel = user.level || 1;
  const oldExp = user.exp || 0;
  
  user.exp = oldExp + amount;
  
  // 레벨업 체크 (100 경험치 = 1레벨)
  while (user.exp >= 100) {
    user.exp -= 100;
    user.level = (user.level || 1) + 1;
  }
  
  const leveledUp = user.level > oldLevel;
  
  // 서버에 저장
  await saveUserToServer(user);
  
  // 알림 메시지 반환
  if (leveledUp) {
    const message = `🎉 레벨업! Lv.${oldLevel} → Lv.${user.level}\n✨ ${reason} 경험치 +${amount}`;
    if (showAlert) {
      alert(message);
    }
    return { leveledUp: true, message, user };
  } else {
    const message = `✨ ${reason} 경험치 +${amount}\n현재: ${user.exp}/100 (레벨 ${user.level})`;
    if (showAlert) {
      alert(message);
    }
    return { leveledUp: false, message, user };
  }
}

/* =====================================================
      🟢 지도 페이지 : 건물 클릭 → 팝업 표시
===================================================== */

function loadMap() {
  requireLogin();
  
  // 플레이어 캐릭터 초기화
  initPlayer();
  
  // 방향키 이벤트 리스너 추가
  document.addEventListener('keydown', handleKeyPress);
  
  // 모바일 컨트롤 버튼 이벤트
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const direction = btn.getAttribute('data-direction');
      movePlayer(direction);
    });
    
    // 터치 이벤트도 추가 (길게 누르면 연속 이동)
    let moveInterval;
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const direction = btn.getAttribute('data-direction');
      movePlayer(direction);
      moveInterval = setInterval(() => movePlayer(direction), 100);
    });
    btn.addEventListener('touchend', () => {
      clearInterval(moveInterval);
    });
  });

  document.querySelectorAll(".building-label").forEach(label => {
    label.addEventListener("click", async () => {
      const name = label.textContent.trim();
      
      // 근처에 있지 않으면 클릭 무시
      if (!label.classList.contains('nearby')) {
        alert("🚶‍♂️ 캐릭터를 건물 근처로 이동시켜주세요!");
        return;
      }
      
      // 건물 클릭 시 즉시 방문 기록 (팝업 표시 전)
      await markBuildingAsVisited(name);
      checkNearbyBuildings(); // 색상 즉시 업데이트
      
      const data = buildingData[name];
      const solvedQuizzes = getSolvedQuizzes();
      const isQuizSolved = solvedQuizzes.includes(name);

      let popupHTML = `
        <div class="popup-content">
          <h3>${name}</h3>
          ${data?.img ? `<img src="${data.img}" class="popup-img">` : ""}
          <p>${data?.desc || "이 건물은 등록된 정보가 없습니다."}</p>
      `;

      // 퀴즈가 있으면 추가
      if (data?.quiz) {
        popupHTML += `<div class="quiz-section">`;
        popupHTML += `<p><b>퀴즈:</b> ${data.quiz.question}</p>`;
        
        if (isQuizSolved) {
          popupHTML += `
            <div class="quiz-solved">
              <p class="solved-message">✅ 이미 풀었습니다!</p>
              <p class="correct-answer">정답: <strong>${data.quiz.answer}</strong></p>
            </div>
          `;
        } else {
          popupHTML += data.quiz.options
            .map(opt => `<button class="quiz-option">${opt}</button>`)
            .join("");
        }
        
        popupHTML += `</div>`;
      }

      popupHTML += `<button class="close-btn">닫기</button></div>`;

      const popup = document.createElement("div");
      popup.classList.add("popup");
      popup.innerHTML = popupHTML;
      document.body.appendChild(popup);

      // 닫기 버튼 클릭 시 팝업 닫고 경험치 알림
      popup.querySelector(".close-btn").addEventListener("click", () => {
        popup.remove();
        // 건물 정보를 본 후 경험치 +5 (방문 기록은 이미 위에서 함)
        addExperience(5, "건물 방문", true);
      });

      // 퀴즈 정답 처리 (아직 안 푼 퀴즈만)
      if (data?.quiz && !isQuizSolved) {
        popup.querySelectorAll(".quiz-option").forEach(btn => {
          btn.addEventListener("click", async () => {
            if (btn.textContent === data.quiz.answer) {
              btn.style.backgroundColor = "#4CAF50";
              alert("정답입니다! 🎉");

              // 퀴즈를 푼 것으로 표시 (비동기 대기)
              await markQuizAsSolved(name);
              
              // 뱃지 체크 (퀴즈 저장 후 실행)
              await checkBadgeReward();

              setTimeout(() => {
                popup.remove();
                // 팝업 닫힌 후 퀴즈 정답 경험치 +10 (방문 기록은 이미 위에서 함)
                addExperience(10, "퀴즈 정답", true);
              }, 800);
            } else {
              btn.style.backgroundColor = "#f44336";
              alert("틀렸습니다! 다시 시도해보세요.");
            }
          });
        });
      }
    });
  });
}


/* =====================================================
      🟢 캐릭터 선택 페이지
===================================================== */
function loadSelectPage() {
  requireLogin();

  document.querySelectorAll(".char-card").forEach((card, index) => {
    card.addEventListener("click", async () => {
      let user = JSON.parse(sessionStorage.getItem("currentUser"));
      user.character = index + 1;

      // 서버에 저장
      await saveUserToServer(user);

      alert("캐릭터가 변경되었습니다!");
    });
  });
}


/* =====================================================
      🟢 페이지 로드시 자동 실행
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("signup.html")) {
    const form = document.querySelector("form");
    if (form) form.addEventListener("submit", handleSignup);

  } else if (path.includes("login.html")) {
    const form = document.querySelector("form");
    if (form) form.addEventListener("submit", handleLogin);

  } else if (path.includes("index.html")) {
    loadMap();
    const logoutBtn = document.querySelector("#logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  } else if (path.includes("my.html")) {
    loadMyPage();
    const logoutBtn = document.querySelector("#logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  } else if (path.includes("select.html")) {
    loadSelectPage();
    const logoutBtn = document.querySelector("#logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  }
});
