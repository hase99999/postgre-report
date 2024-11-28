const fs = require('fs');
const xml2js = require('xml2js');

// 置換するタグのマッピング
const tagMapping = {
    診断医: 'docname',
    所属科: 'department',
    ﾊﾟｽﾜｰﾄﾞ: 'password',
    病院名: 'hospital',
    種類: 'level',
    ID: 'employeeNumber',
  // 他のタグのマッピングを追加
};

// XMLファイルの読み込み
fs.readFile('input.xml', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading XML file:', err);
    return;
  }

  // XMLをJavaScriptオブジェクトに変換
  xml2js.parseString(data, { explicitArray: false }, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
      return;
    }

    // タグの置換
    const replaceTags = (obj) => {
      if (typeof obj === 'object') {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const newKey = tagMapping[key] || key;
            obj[newKey] = obj[key];
            if (newKey !== key) {
              delete obj[key];
            }
            replaceTags(obj[newKey]);
          }
        }
      }
    };

    replaceTags(result);

    // JavaScriptオブジェクトをXMLに変換
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(result);

    // 置換後のXMLをファイルに書き込み
    fs.writeFile('output.xml', xml, (err) => {
      if (err) {
        console.error('Error writing XML file:', err);
        return;
      }
      console.log('XML tags replaced successfully');
    });
  });
});