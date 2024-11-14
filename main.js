import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, increment, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBn77hs3dwx_r1smbqRW10FhLW8mmJ9Ygo",
  authDomain: "poker-lab-app.firebaseapp.com",
  projectId: "poker-lab-app",
  storageBucket: "poker-lab-app.firebasestorage.app",
  messagingSenderId: "837402802874",
  appId: "1:837402802874:web:9df0708877f3ebf0e66083",
  measurementId: "G-6N0NVZ0CJW",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("app.jsが読み込まれました"); // app.jsの読み込み確認

const userTable = document.getElementById("userTable");
const addUserButton = document.getElementById("addUserButton");

if (addUserButton) {
  console.log("ユーザー追加ボタンが見つかりました"); // ボタン確認用ログ
  addUserButton.addEventListener("click", async () => {
    console.log("ユーザーを追加ボタンがクリックされました"); // ボタンクリック確認用ログ

    const userName = prompt("ユーザー名を入力してください:");
    const password = prompt("パスワードを入力してください:");
    const confirmPassword = prompt("パスワードを再入力してください:");

    if (userName && password && password === confirmPassword) {
      console.log("ユーザー追加情報:", { userName, password }); // ユーザー情報確認用ログ

      try {
        await addDoc(collection(db, "users"), {
          name: userName,
          password: password,
          chips: 10000,
        });

        console.log("ユーザーがFirestoreに追加されました"); // Firestore追加確認用ログ
        alert("ユーザーが追加されました");
        fetchUsers(); // ユーザーリストを再表示
      } catch (error) {
        console.error("ユーザーの追加に失敗しました:", error); // エラー発生時のログ
      }
    } else {
      alert("入力が正しくありません。");
    }
  });
} else {
  console.error("ユーザー追加ボタンが見つかりません"); // エラー発生時のログ
}

// ユーザーリストの取得と表示
async function fetchUsers() {
  try {
    // Firestoreクエリを作成
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, orderBy("chips", "desc"));
    const querySnapshot = await getDocs(usersQuery);

    console.log("データ取得成功"); // デバッグログ
    userTable.innerHTML = "";

    let rank = 1;  // 修正箇所: 明示的にランクを管理

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log("取得したユーザーデータ:", userData); // デバッグログ

      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${rank}</td> <!-- 修正箇所: rank変数を使用 -->
          <td>${userData.name}</td>
          <td>${userData.chips}</td>
          <td>
              <button onclick="showDetail('${doc.id}', '${userData.password}')">詳細</button>
              <button class="button-red" onclick="deleteUserPrompt('${doc.id}')">削除</button>
          </td>
      `;
      userTable.appendChild(row);
      rank++; // 次のユーザーのランクを更新
      console.log(userTable);
    });
  } catch (error) {
    console.error("データ取得エラー:", error); // エラー発生時のログ
  }
}

// 修正箇所: 関数をグローバルに公開
window.deleteUserPrompt = async function (userId) {
  const adminCode = prompt("管理者情報を入力してください:");
  if (adminCode === "123") {
    const confirmDelete = confirm("本当に削除しますか？");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert("ユーザーが削除されました");
        fetchUsers();
      } catch (error) {
        console.error("ユーザーの削除に失敗しました:", error); // エラーが発生した場合のデバッグログ
      }
    }
  } else {
    alert("管理者情報が正しくありません。");
  }
};

// 修正箇所: 関数をグローバルに公開
window.showDetail = async function (userId, userPassword) {
  const inputPassword = prompt("パスワードを入力してください:");
  if (inputPassword === userPassword) {
    const action = prompt(
      "「1: チップの引き出し」または「2: チップの預け入れ」を選択してください:"
    );
    const amount = parseInt(prompt("金額を入力してください:"));

    try {
      if (action === "1") {
        await updateDoc(doc(db, "users", userId), {
          chips: increment(-amount),
        });
        alert(`${amount}チップが引き出されました`);
      } else if (action === "2") {
        await updateDoc(doc(db, "users", userId), {
          chips: increment(amount),
        });
        alert(`${amount}チップが預け入れされました`);
      }
      fetchUsers();
    } catch (error) {
      console.error("チップの更新に失敗しました:", error); // エラーが発生した場合のデバッグログ
    }
  } else {
    alert("パスワードが間違っています。");
  }
};

// 初回ロード時にユーザーリストを取得
fetchUsers();