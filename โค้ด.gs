function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบรับสมัครนักเรียนออนไลน์');
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'submit') {
      return submitApplication(data);
    } else if (action === 'getAll') {
      return getAllApplications();
    } else if (action === 'update') {
      return updateApplication(data);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function submitApplication(data) {
  const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  const sheet = ss.getSheetByName('Applications') || ss.insertSheet('Applications');
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'เลขบัตรประชาชน', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 
      'ชื่อ (EN)', 'นามสกุล (EN)', 'วันเกิด', 'โรงพยาบาล', 
      'หมู่เลือด', 'สัญชาติ', 'เชื้อชาติ', 'ศาสนา',
      'พื้นที่บริการ', 'ตำบล', 'อำเภอ', 'จังหวัด',
      'โรงเรียนเดิม', 'ระดับชั้น', 'GPA', 'โครงการ',
      'เอกสาร', 'อื่นๆ', 'สถานะ', 'วันที่สมัคร'
    ]);
  }
  
  const existingRow = findRowByIdCard(sheet, data.idCard);
  const rowData = [
    data.idCard, data.prefix, data.firstName, data.lastName,
    data.firstNameEn, data.lastNameEn, data.birthDate, data.birthHospital,
    data.bloodType, data.nationality, data.ethnicity, data.religion,
    data.serviceArea, data.subdistrict, data.district, data.province,
    data.previousSchool, data.gradeLevel, data.gpa, data.program,
    data.documents, data.otherDocument, 'สมัครแล้ว', new Date()
  ];
  
  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true
  })).setMimeType(ContentService.MimeType.JSON);
}

function getAllApplications() {
  const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  const sheet = ss.getSheetByName('Applications');
  
  if (!sheet || sheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const applications = data.map(row => ({
    idCard: row[0],
    prefix: row[1],
    firstName: row[2],
    lastName: row[3],
    firstNameEn: row[4],
    lastNameEn: row[5],
    birthDate: row[6],
    birthHospital: row[7],
    bloodType: row[8],
    nationality: row[9],
    ethnicity: row[10],
    religion: row[11],
    serviceArea: row[12],
    subdistrict: row[13],
    district: row[14],
    province: row[15],
    previousSchool: row[16],
    gradeLevel: row[17],
    gpa: row[18],
    program: row[19],
    documents: row[20],
    otherDocument: row[21],
    status: row[22],
    submittedDate: row[23]
  }));
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: applications
  })).setMimeType(ContentService.MimeType.JSON);
}

function findRowByIdCard(sheet, idCard) {
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === idCard) {
      return i + 2;
    }
  }
  return -1;
}
