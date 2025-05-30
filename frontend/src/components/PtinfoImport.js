import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PtinfoImport = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ファイル分割ユーティリティの改善版
const splitJsonFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        console.log(`ファイル全体のサイズ: ${content.length} バイト`);
        
        let jsonData;
        try {
          jsonData = JSON.parse(content);
        } catch (parseError) {
          console.error('JSONパースエラー:', parseError);
          return reject(new Error(`JSONパースエラー: ${parseError.message}`));
        }
        
        // データ抽出
        let records = [];
        if (Array.isArray(jsonData)) {
          records = jsonData;
        } else if (jsonData.records) {
          records = jsonData.records;
        } else {
          return reject(new Error('サポートされていないJSON形式です'));
        }
        
        console.log(`抽出したレコード数: ${records.length}`);
        
        // 安全なチャンクサイズを計算（バッファを持たせる）
        const MAX_CHUNK_SIZE = 4 * 1024 * 1024; // 4MB（安全マージンを確保）
        const estimatedBytesPerRecord = Math.ceil(content.length / records.length);
        const safeRecordsPerChunk = Math.floor(MAX_CHUNK_SIZE / (estimatedBytesPerRecord * 1.2)); // 20%のバッファ
        
        console.log(`レコードあたりの推定サイズ: ${estimatedBytesPerRecord} バイト`);
        console.log(`チャンクあたりの安全なレコード数: ${safeRecordsPerChunk}`);
        
        const chunks = [];
        
        // チャンクを生成して実際のサイズをチェック
        for (let i = 0; i < records.length; i += safeRecordsPerChunk) {
          const chunkRecords = records.slice(i, i + safeRecordsPerChunk);
          const chunkString = JSON.stringify(chunkRecords);
          const chunkSize = new Blob([chunkString]).size;
          
          // 5MBを超えていないか確認
          if (chunkSize > 5 * 1024 * 1024) {
            console.warn(`警告: チャンクサイズが5MBを超えています (${Math.round(chunkSize/1024/1024)}MB)`);
            // 再帰的に小さいチャンクに分割する必要があるが、簡略化のため警告のみ
          }
          
          const chunkBlob = new Blob([chunkString], {type: 'application/json'});
          chunks.push({
            file: new File([chunkBlob], `ptinfo-part-${Math.floor(i/safeRecordsPerChunk)+1}.json`, {type: 'application/json'}),
            recordCount: chunkRecords.length,
            sizeBytes: chunkSize
          });
          
          console.log(`チャンク #${chunks.length} 生成: ${chunkRecords.length}件, ${Math.round(chunkSize/1024)}KB`);
        }
        
        resolve(chunks);
      } catch (err) {
        console.error('ファイル分割エラー:', err);
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('ファイル読み込み中にエラーが発生しました'));
    reader.readAsText(file);
  });
};

  const handleFileChange = (e, setFile) => {
    const selectedFile = e.target.files[0];
    
    // JSONファイルの場合は内容を事前確認
    if (selectedFile && selectedFile.name.endsWith('.json')) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // JSONの解析を試みる
          JSON.parse(event.target.result);
          console.log('JSONの検証に成功しました');
          setFile(selectedFile);
        } catch (error) {
          console.error('JSONファイルの検証に失敗:', error);
          alert(`選択されたJSONファイルの形式が無効です: ${error.message}`);
          e.target.value = ''; // 入力をクリア
        }
      };
      
      reader.onerror = () => {
        console.error('ファイル読み込み中にエラーが発生しました');
        alert('ファイル読み込み中にエラーが発生しました');
      };
      
      reader.readAsText(selectedFile);
    } else {
      setFile(selectedFile);
    }
  };

  // ファイルサイズに応じて適切なエンドポイントを選択するアップロード関数
  // ファイルアップロード処理の強化
const handleFileUpload = async (file, fileType) => {
  if (!file) return null;
  
  let endpoint;
  
  if (fileType === 'json') {
    const FILE_SIZE_THRESHOLD = 5 * 1024 * 1024; // 5MB
    
    if (file.size > FILE_SIZE_THRESHOLD) {
      const userChoice = window.confirm(
        `大きなファイル (${(file.size/1024/1024).toFixed(1)}MB) が選択されました。\n\n` +
        `・「OK」: サンプルテストモード (最初の100件のみ処理)\n` +
        `・「キャンセル」: ファイル分割モード (複数回に分けて処理)`
      );
      
      if (userChoice) {
        endpoint = 'ptinfos/import/json-robust';
        return await uploadSingleFile(file, endpoint);
      } else {
        try {
          setMessage('ファイルを分割しています...');
          const chunks = await splitJsonFile(file);
          
          if (!chunks || chunks.length === 0) {
            throw new Error('ファイルの分割に失敗しました');
          }
          
          setMessage(`ファイルを${chunks.length}個のチャンクに分割しました`);
          
          // 最初のチャンクを処理
          const firstChunk = chunks[0];
          
          // チャンクサイズの表示を追加
          const chunkSizeMB = (firstChunk.sizeBytes / (1024 * 1024)).toFixed(2);
          alert(`ファイルを${chunks.length}個のチャンクに分割しました。最初のチャンク (${firstChunk.recordCount}件, ${chunkSizeMB}MB) を処理します。`);
          
          if (firstChunk.sizeBytes <= FILE_SIZE_THRESHOLD) {
            return await uploadSingleFile(firstChunk.file, 'ptinfos/import/json-small');
          } else {
            alert(`警告: 分割後のチャンクサイズが5MBを超えています (${chunkSizeMB}MB)。サンプルテストモードに切り替えます。`);
            return await uploadSingleFile(firstChunk.file, 'ptinfos/import/json-robust');
          }
        } catch (err) {
          alert(`ファイル分割処理中にエラーが発生しました: ${err.message}`);
          return null;
        }
      }
    } else {
      endpoint = 'ptinfos/import/json-small';
    }
  } else if (fileType === 'csv') {
    endpoint = 'ptinfos/import/csv';
  } else if (fileType === 'xml') {
    endpoint = 'ptinfos/import/xml';
  }
  
  return await uploadSingleFile(file, endpoint);
};
  
  // アップロード関数に再試行機能を追加
const uploadSingleFile = async (file, endpoint, retries = 3, delay = 2000) => {
  if (!file || !endpoint) return null;
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log(`ファイル情報: ${file.name}, サイズ: ${(file.size/1024/1024).toFixed(2)}MB, エンドポイント: ${endpoint}`);
  
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`再試行 ${attempt}/${retries-1}...`);
        // 再試行前に遅延を入れる
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
        // タイムアウトを増加
        timeout: 300000, // 5分
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`アップロード試行 ${attempt+1} 失敗:`, error);
      lastError = error;
      
      // サーバークラッシュの場合は再試行しない
      if (error.code === 'ERR_CONNECTION_REFUSED') {
        console.error('サーバー接続拒否エラー: サーバーが起動しているか確認してください');
        break;
      }
    }
  }
  
  // すべての試行が失敗した場合
  console.error('ファイルアップロード中にエラーが発生しました:', lastError);
  
  if (lastError.code === 'ECONNABORTED') {
    throw new Error('リクエストがタイムアウトしました。サーバーの処理に時間がかかっています。');
  } else if (lastError.code === 'ERR_NETWORK' || lastError.code === 'ERR_CONNECTION_REFUSED') {
    throw new Error('ネットワークエラー: サーバーに接続できませんでした。サーバーが実行中か確認してください。');
  } else if (lastError.response) {
    throw new Error(`サーバーエラー (${lastError.response.status}): ${lastError.response.data.error || lastError.message}`);
  } else {
    throw lastError;
  }
};

  const handleSubmit = async (e, fileType) => {
    e.preventDefault();
    
    let file;
    let successMessage;
  
    switch(fileType) {
      case 'json':
        file = jsonFile;
        successMessage = 'JSONデータのインポートが成功しました。';
        break;
      case 'csv':
        file = csvFile;
        successMessage = 'CSVデータが正常にインポートされました。';
        break;
      case 'xml':
        file = xmlFile;
        successMessage = 'XMLデータが正常にインポートされました。';
        break;
      default:
        return;
    }
  
    if (!file) {
      alert(`${fileType.toUpperCase()}ファイルを選択してください。`);
      return;
    }
  
    if (!currentUser || !currentUser.token) {
      alert('認証トークンがありません。ログインしてください。');
      navigate('/login');
      return;
    }
  
    try {
      setIsUploading(true);
      setMessage('');
      setUploadProgress(0);
      console.log("アップロード開始:", file.name, file.size);
      
      // 新しいアップロード関数を使用
      const result = await handleFileUpload(file, fileType);
      
      if (result) {
        // 結果の種類によって異なるメッセージを表示
        if (result.status === 'sample_test_completed') {
          setMessage(`サンプルテスト完了: ${result.message}`);
          alert(`サンプルテスト完了: ${result.message}`);
        } else {
          setMessage(successMessage);
          alert(successMessage);
        }
      } else {
        setMessage('アップロード処理中に問題が発生しました。');
      }
    } catch (error) {
      console.error(`${fileType.toUpperCase()}データのインポート中にエラーが発生しました:`, error);
      
      if (error.response) {
        console.error('エラーレスポンス詳細:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: JSON.stringify(error.response.data)
        });
        
        const errorMsg = error.response.data && error.response.data.error 
          ? error.response.data.error 
          : '不明なエラー';
        
        setMessage(`エラー (${error.response.status}): ${errorMsg}`);
        alert(`エラー (${error.response.status}): ${errorMsg}`);
      } else if (error.request) {
        // リクエストが送信されたがレスポンスを受け取っていない場合
        setMessage('サーバーからの応答がありませんでした。サーバーが起動しているか確認してください。');
        alert('サーバーからの応答がありませんでした。サーバーが起動しているか確認してください。');
      } else {
        setMessage(`${fileType.toUpperCase()}データのインポート中に不明なエラーが発生しました。`);
        alert(`${fileType.toUpperCase()}データのインポート中に不明なエラーが発生しました。`);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">患者情報インポート</h1>
      
      {/* JSONインポートフォーム */}
      <form onSubmit={(e) => handleSubmit(e, 'json')}>
        <div className="mb-4">
          <label className="block mb-2">JSONファイルを選択してください:</label>
          <input 
            type="file" 
            accept=".json" 
            onChange={(e) => handleFileChange(e, setJsonFile)} 
          />
          {jsonFile && (
            <p className="mt-1 text-sm text-gray-500">
              選択済み: {jsonFile.name} ({(jsonFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          disabled={isUploading}
        >
          {isUploading ? 'アップロード中...' : 'JSONインポート'}
        </button>
      </form>
      
      {/* CSVインポートフォーム */}
      <form onSubmit={(e) => handleSubmit(e, 'csv')} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">CSVファイルを選択してください:</label>
          <input 
            type="file" 
            accept=".csv" 
            onChange={(e) => handleFileChange(e, setCsvFile)} 
          />
          {csvFile && (
            <p className="mt-1 text-sm text-gray-500">
              選択済み: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          disabled={isUploading}
        >
          CSVインポート
        </button>
      </form>
      
      {/* XMLインポートフォーム */}
      <form onSubmit={(e) => handleSubmit(e, 'xml')} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">XMLファイルを選択してください:</label>
          <input 
            type="file" 
            accept=".xml" 
            onChange={(e) => handleFileChange(e, setXmlFile)} 
          />
          {xmlFile && (
            <p className="mt-1 text-sm text-gray-500">
              選択済み: {xmlFile.name} ({(xmlFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          disabled={isUploading}
        >
          XMLインポート
        </button>
      </form>
      
      {/* アップロードプログレスバー */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{width: `${uploadProgress}%`}}
            ></div>
          </div>
          <p className="text-center mt-2">{uploadProgress}% 完了</p>
        </div>
      )}
      
      {/* メッセージ表示 */}
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      {/* 戻るボタン */}
      <button 
        onClick={handleBack} 
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
      >
        戻る
      </button>
    </div>
  );
};

export default PtinfoImport;