import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Papa from 'papaparse';
import xml2js from 'xml2js';
import { useNavigate } from 'react-router-dom';

const ReportImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [message, setMessage] = useState('');
  const [processingStatus, setProcessingStatus] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
    setMessage('');  // メッセージをクリア
    setProcessingStatus(null); // 処理ステータスをリセット
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) {
      alert('JSONファイルを選択してください。');
      return;
    }
    
    setProcessingStatus('checking');
    setMessage('ファイルを確認しています...');
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        // JSONをパース
        const jsonData = JSON.parse(event.target.result);
        
        // サンプルデータを確認（最初の1件）
        let sampleData = null;
        let reports = [];
        
        if (Array.isArray(jsonData)) {
          reports = jsonData;
          sampleData = jsonData[0];
        } else if (jsonData.reports && Array.isArray(jsonData.reports)) {
          reports = jsonData.reports;
          sampleData = jsonData.reports[0];
        } else {
          throw new Error('対応していないJSONフォーマットです。');
        }
        
        // レポートフィールドの有無を確認
        let hasReportField = false;
        let emptyReportCount = 0;
        
        if (sampleData) {
          hasReportField = 'report' in sampleData;
          
          // サンプルデータの確認（先頭10件まで）
          const checkSample = reports.slice(0, 10);
          emptyReportCount = checkSample.filter(r => !r.report).length;
          
          setMessage(`データ確認: ${reports.length}件のレコード検出, reportフィールド ${hasReportField ? '有り✅' : '無し❌'}`);
          
          if (hasReportField && emptyReportCount > 0) {
            setMessage(prev => `${prev}, 空のreport ${emptyReportCount}/10件`);
          }
          
          console.log('サンプルデータ:', sampleData);
        }
        
        // レポート本文がない場合は警告
        if (!hasReportField) {
          if (!window.confirm('レポート本文(report)フィールドが見つかりません。処理を続行しますか？')) {
            setMessage('処理をキャンセルしました。');
            setProcessingStatus('cancelled');
            return;
          }
        } else if (emptyReportCount === Math.min(10, reports.length)) {
          if (!window.confirm('確認したサンプルではすべてのレポート本文が空です。処理を続行しますか？')) {
            setMessage('処理をキャンセルしました。');
            setProcessingStatus('cancelled');
            return;
          }
        }
        
        // 通常のアップロード処理を実行
        setProcessingStatus('uploading');
        setMessage(`データをアップロード中... (${reports.length}件)`);
        
        const formData = new FormData();
        formData.append('file', jsonFile);
        
        const response = await axiosInstance.post('reports/import/json', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setProcessingStatus('completed');
        setMessage(`処理完了: ${response.data.message}`);
        alert(`JSONデータのインポートが完了しました\n${response.data.message}`);
        
      } catch (error) {
        console.error('JSONデータのインポート中にエラーが発生しました:', error);
        setProcessingStatus('error');
        setMessage(`エラー: ${error.message}`);
        alert('JSONデータのインポートに失敗しました');
      }
    };
    
    reader.readAsText(jsonFile);
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert('CSVファイルを選択してください。');
      return;
    }
    
    setProcessingStatus('uploading');
    setMessage('CSVデータをアップロード中...');
    
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const response = await axiosInstance.post('reports/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProcessingStatus('completed');
      setMessage(`処理完了: ${response.data.message}`);
      alert('CSVデータのインポートが完了しました');
    } catch (error) {
      console.error('CSVデータのインポート中にエラーが発生しました:', error);
      setProcessingStatus('error');
      setMessage(`エラー: ${error.response?.data?.error || error.message}`);
      alert('CSVデータのインポートに失敗しました');
    }
  };

  const handleXmlSubmit = async (e) => {
    e.preventDefault();
    if (!xmlFile) {
      alert('XMLファイルを選択してください。');
      return;
    }
    
    setProcessingStatus('checking');
    setMessage('XMLファイルを解析中...');
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parser = new xml2js.Parser({ explicitArray: true });
        const result = await parser.parseStringPromise(event.target.result);
        
        if (!result.reports || !result.reports.report) {
          throw new Error('XMLファイルに有効なレポートデータが見つかりません。');
        }
        
        const xmlReports = result.reports.report;
        setMessage(`${xmlReports.length}件のレポートデータを検出しました。処理を開始します...`);
        
        // レポートデータの変換
        const data = xmlReports.map(item => {
          // 複数値の場合は最初の要素を取得、なければ空文字/nullを設定
          const getFirstOrDefault = (field) => {
            return item[field] && item[field].length > 0 ? item[field][0] : '';
          };
          
          return {
            examdate: getFirstOrDefault('examdate'),
            ptnumber: getFirstOrDefault('ptnumber'),
            modality: getFirstOrDefault('modality'),
            doctor: getFirstOrDefault('doctor'),
            department: getFirstOrDefault('department'),
            clinicaldiag: getFirstOrDefault('clinicaldiag'),
            imagediag: getFirstOrDefault('imagediag'),
            report: getFirstOrDefault('report'),  // レポート本文
            finaldiag: getFirstOrDefault('finaldiag'),
            interesting: getFirstOrDefault('interesting'),
            inputby: getFirstOrDefault('inputby'),
            inputdate: getFirstOrDefault('inputdate'),
            site: getFirstOrDefault('site'),
            inputtime: getFirstOrDefault('inputtime'),
          };
        });
        
        // レポート本文の確認
        const emptyReportCount = data.filter(item => !item.report).length;
        if (emptyReportCount > 0) {
          const percentage = ((emptyReportCount / data.length) * 100).toFixed(1);
          setMessage(`警告: ${emptyReportCount}件(${percentage}%)のレポートに本文がありません。`);
          
          if (emptyReportCount === data.length) {
            if (!window.confirm('すべてのレポート本文が空です。処理を続行しますか？')) {
              setMessage('処理をキャンセルしました。');
              setProcessingStatus('cancelled');
              return;
            }
          }
        }
        
        // データのインポートを開始
        setProcessingStatus('processing');
        await importData(data);
        
      } catch (error) {
        console.error('XMLデータの処理中にエラーが発生しました:', error);
        setProcessingStatus('error');
        setMessage(`エラー: ${error.message}`);
        alert('XMLデータの処理に失敗しました');
      }
    };
    reader.readAsText(xmlFile);
  };

  // XMLインポート処理
  const importData = async (data) => {
    try {
      const chunkSize = 100; // 分割するサイズ
      let successCount = 0;
      let totalChunks = Math.ceil(data.length / chunkSize);
      
      setMessage(`${data.length}件のデータを処理します... (${totalChunks}チャンク)`);
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const chunkNum = Math.floor(i / chunkSize) + 1;
        
        setMessage(`チャンク ${chunkNum}/${totalChunks} 処理中 (${i+1}-${Math.min(i+chunkSize, data.length)}/${data.length}件)...`);
        
        const response = await axiosInstance.post('reports/import/xml-data', chunk);
        
        if (response.data.success) {
          const parts = response.data.message.split(':')[1].trim().split(',');
          const success = parseInt(parts[0].split('件')[0].trim());
          successCount += success;
        }
        
        setMessage(`${successCount}/${data.length}件のデータを処理しました (チャンク ${chunkNum}/${totalChunks} 完了)`);
      }
      
      setProcessingStatus('completed');
      setMessage(`XMLデータのインポートが完了しました: ${successCount}/${data.length}件処理成功`);
      alert(`XMLデータのインポートが完了しました: ${successCount}/${data.length}件処理成功`);
    } catch (error) {
      console.error('XMLデータのインポート中にエラーが発生しました:', error);
      setProcessingStatus('error');
      setMessage(`エラー: ${error.message}`);
      alert('XMLデータのインポートに失敗しました');
    }
  };

  const handleJsonExport = async () => {
    try {
      setMessage('JSONデータをエクスポート中...');
      const response = await axiosInstance.get('reports/export/json');
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports_${getFormattedDate()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage(`${response.data.length}件のレポートをJSONとしてエクスポートしました`);
    } catch (error) {
      console.error('JSONデータのエクスポート中にエラーが発生しました:', error);
      setMessage(`エラー: ${error.message}`);
      alert('JSONデータのエクスポートに失敗しました');
    }
  };

  const handleXmlExport = async () => {
    try {
      setMessage('XMLデータをエクスポート中...');
      const response = await axiosInstance.get('reports/export/xml');
      
      // XMLデータを直接取得する場合
      let xmlData = response.data;
      if (typeof xmlData !== 'string') {
        // オブジェクトの場合はXMLに変換
        const builder = new xml2js.Builder();
        xmlData = builder.buildObject(response.data);
      }
      
      const blob = new Blob([xmlData], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports_${getFormattedDate()}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      
      // レポート件数の計算
      let reportCount = 0;
      if (typeof response.data === 'object' && response.data.reports && Array.isArray(response.data.reports.report)) {
        reportCount = response.data.reports.report.length;
      }
      
      setMessage(`${reportCount}件のレポートをXMLとしてエクスポートしました`);
    } catch (error) {
      console.error('XMLデータのエクスポート中にエラーが発生しました:', error);
      setMessage(`エラー: ${error.message}`);
      alert('XMLデータのエクスポートに失敗しました');
    }
  };

  // 日付フォーマット用ヘルパー関数
  const getFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const handleBack = () => {
    navigate('/home');
  };

  // 処理状態に応じたスタイルを返す関数
  const getStatusStyle = (status) => {
    switch (status) {
      case 'checking': return 'text-blue-500';
      case 'uploading': return 'text-yellow-500';
      case 'processing': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'cancelled': return 'text-gray-500';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">レポートインポート</h1>
      <form onSubmit={handleJsonSubmit}>
        <div className="mb-4">
          <label className="block mb-2">JSONファイルを選択してください:</label>
          <input type="file" accept=".json" onChange={(e) => handleFileChange(e, setJsonFile)} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          JSONインポート
        </button>
      </form>
      <form onSubmit={handleCsvSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">CSVファイルを選択してください:</label>
          <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, setCsvFile)} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          CSVインポート
        </button>
      </form>
      <form onSubmit={handleXmlSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">XMLファイルを選択してください:</label>
          <input type="file" accept=".xml" onChange={(e) => handleFileChange(e, setXmlFile)} />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          XMLインポート
        </button>
      </form>
      <div className="mt-4">
        <button onClick={handleJsonExport} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
          JSONエクスポート
        </button>
        <button onClick={handleXmlExport} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          XMLエクスポート
        </button>
      </div>
      {message && (
        <p className={`mt-4 ${getStatusStyle(processingStatus)}`}>
          {message}
        </p>
      )}
      <button onClick={handleBack} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4">
        戻る
      </button>
    </div>
  );
};

export default ReportImport;