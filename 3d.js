const GLB_PATH_FILE = 'https://cdn.jsdelivr.net/gh/duycop/glb_store@main/1.glb';
const fake = 1;
var delta_cong = 0.01;
import * as THREE from 'three';
//import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/gh/duycop/glb_store@main/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/gh/duycop/glb_store@main/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/gh/duycop/glb_store@main/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/gh/duycop/glb_store@main/jsm/loaders/DRACOLoader.js';
let mixer;
const api = '/api/';
const clock = new THREE.Clock();
const container = document.getElementById('container');
//const stats = new Stats();
//container.appendChild( stats.dom ); //hiển thị cac thông số
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0xF6F6F6);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(1, 1, 1);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.4, 0);
controls.update();
controls.enablePan = true;
controls.enableDamping = true;
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load(GLB_PATH_FILE, function (gltf) {
  window.gltf = gltf;
  const model = gltf.scene;
  model.position.set(0, 0, 0);
  model.scale.set(0.2, 0.2, 0.2);
  scene.add(model);
  mixer = new THREE.AnimationMixer(model);
  window.mixer = mixer; //đưa ra ngoài sử dụng
  //mixer.clipAction( gltf.animations[ 0 ] ).play();
  console.log(gltf)
  animate();
  //controls.autoRotate=true;
  controls.autoRotateSpeed = 2;
  model.castShadow = true;
  model.receiveShadow = true;
  model.matrixWorldNeedsUpdate = true;
  init_map();
  show_hide_gui(false);
}, undefined, function (e) {
  console.error(e);
});
window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer.update(delta);
  controls.update();
  //stats.update();
  renderer.render(scene, camera);
  //if(camera.position.x>5)controls.autoRotateSpeed=-3
  //if(camera.position.x<-4.5)controls.autoRotateSpeed=3
  /*
  var p=camera.position;
  var s='';
  s+=`camera.position.set( `+p.x+`, `+p.y+`, `+p.z+`)\n`;
  p=camera.rotation;
  s+=`camera.rotation.set( `+p.x+`, `+p.y+`, `+p.z+`)\n`
  p=controls.target;
  s+=`controls.target.set( `+p.x+`, `+p.y+`, `+p.z+`)\n`
  console.log(s);//,renderer,scene,camera,controls,mixer,delta,animate)
  /**/
}

//--zone audio ---
//var audioElement = document.createElement('audio');
//audioElement.setAttribute('src', '/mp3/fire_alarm.mp3');
//audioElement.addEventListener('ended', function () {
//  this.play();
//}, false);
function playAlarm(playing) {
  /*
  if (playing){
    audioElement.play();
  }else {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  /**/
}
var playing = false;
var audio_host = 'https://doosung.duckdns.org';
function say_vn(text) {
  if (playing) return;
  $.post(audio_host + '/mp3/any.php',
    {
      text: text
    },
    function (data) {
      try {
        var json = JSON.parse(data);
        var url = audio_host + "/mp3/" + json.fn;
        var audio = new Audio(url);
        audio.addEventListener('ended', function () {
          playing = false;
        }, false);
        if (playing) return;
        audio.play().catch(function (error) {
          console.log("Chrome cannot play sound without user interaction first")
          toastr["warning"]("Có lỗi! Hãy click vào 3D để cho phép trình duyệt phát âm thanh:<br>" + text);
          playing = false;
        });
        playing = true;
      } catch (ee) {
        playing = false;
      }
    });
}
function goViewHome() {
  //camera.position.set(10.532048128857237, 20.61402845229025, 19.223250949917848)
  //camera.rotation.set(-0.5567666269615603, 0.14584039076337407, 0.09021200164077635)
  //controls.target.set(5.752021515509606, 3.4168588007926513, -8.40475130147995)

  //camera.position.set(-22.59168241835151, 22.173805672006417, 16.71678995549687)
  //camera.rotation.set(-0.7726924158034038, -0.5580893612983138, -0.47658463916283345)
  //controls.target.set(2.3512971342058804, -5.7167688882607575, -11.891685910921069)

  camera.position.set(-28.198609718705615, 9.975399889951818, 4.3391320171650145)
  camera.rotation.set(-1.1453225209579432, -1.2139485326922994, -1.12033757440578)
  controls.target.set(0, 0.4, 0)
}
var timer;
var flag = 0;
const MAX_ZONE = 22;
var COLOR_FIRE1 = 0xff0000, COLOR_FIRE2 = 0xffff00;
var COLOR_MAP_OK = []
//                     1          2         3        4          5       6           7         8         9         10        11          12       13     14          15       16       17         18         19       20       21          22      23        24          25       26       27         28         29        30        31       32       33        34         35       36         37        38         39        40       41        42        43        44       45       46          47        48        49         50       51        52         53       54         55       56        57         58        59       60       61        62        63
var NAME_MAP = ['1', '..', '22']
var ZONE_MAP_INDEX = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  1];//logo,baove, truoc1,truoc2,phai,trai,sau,Sàn

var ZONE_NAME_FIX = ['Zone1', 'Zone1M', 'Zone2', 'Zone2M', 'Zone3', 'GasDetect_Z3', 'Zone3M', 'Zone4', 'GasDetect_Z4', 'Zone4M', 'Zone5', 'Zone6', 'Zone7', 'Zone8', 'Zone9', 'Zone10', 'Zone11', 'Zone12', 'Zone13', 'Zone14', 'Zone15', 'Zone5M', 'F1_Base', 'F1_Fence', 'txtZone1', 'txtZone2', 'txtZone3', 'txtZone4', 'txtZone5', 'txtZone6', 'txtZone7', 'txtZone8', 'txtZone9', 'txtZone10', 'txtZone11', 'txtZone12', 'txtZone13', 'txtZone14', 'txtZone15', 'txtZone1M', 'txtZone2M', 'txtZone3M', 'txtZone4M', 'txtZone5M', 'txtDoosung', 'txtSecurity', 'Gate_02', 'Gate_03', 'Gate_Wheels', 'SecurityOffice', 'Cube', 'Cube.001', 'Cube.002', 'Cube.003', 'Cube.004', 'Cube.005', 'Cube.006', 'Cube.007', 'Cube.008', 'Cube.009', 'Cube.010', 'ZoneBlock', 'txtDS1', 'txtTech1']
//                       1 	   	2		    3	 	4		    5		  6			      7		 8		     9		     10	    	11		 12	      13	  14	   	15		   16		 17		 18		    19		  20		21		 22		    23			24		   25		  26		   27			  28		  29		  30		 31		    32		   33		   34		    35		      36		    37		   38	         39          40           41            42          43            44            45          46            47          48          49                50          51       52           53         54           55         56            57         58           59          60        61          62         63
var fire = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//----------1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0
var HOVER = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//-----------1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0
var opa = [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8];
//-----------1    2    3    4    5    6    7    8    9   A1    1    2    3    4    5    6    7    8    9   A2    1    2    3    4    5    6    7    8    9   A3    1    2    3    4    5    6    7    8    9   A4    1    2    3    4    5    6    7    8    9   A5    1    2    3    4    5    6    7    8    9   A6    1    2    3    4    5    6    7    8    9   A7    1    2    3    4    5    6    7    8    9   A8    1    2    3    4    5    6    7    8    9   A9    1    2    3    4    5    6    7    8    9    0    1    2    3    4    5    6    7    8    9    0
var HH = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var SY = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
//--------1  2  3  4  5  6  7  8  9  A1 1  2  3  4  5  6  7  8  9  A2 1  2  3  4  5  6  7  8  9  A3 1  2  3  4  5  6  7  8  9  A4 1  2  3  4  5  6  7  8  9  A5 1  2  3  4  5  6  7  8  9  A6 1  2  3  4  5  6  7  8  9  A7 1  2  3  4  5  6  7  8  9  A8 1  2  3  4  5  6  7  8  9  A9 1  2  3  4  5  6  7  8  9  B1 1  2  3  4  5  6  7  8  9  0
window.fire = fire;
window.ZONE_MAP_INDEX = ZONE_MAP_INDEX;
window.ZONE_NAME_FIX = ZONE_NAME_FIX;
window.HH = HH;
window.SY = SY;
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function time_diff(t) {
  var dt2 = new Date();
  var dt1 = new Date(t);
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  var that = "<span title='" + diff + "'> &nbsp; </span>";
  if (fake && diff < 180) diff = getRandomInt(2, 4);

  diff = (diff < 0) ? 0 : Math.floor(diff);
  var d, h, m, s;
  s = diff % 60;
  if (diff < 60) {
    return s + ' giây trước' + that;
  } else {
    m = Math.floor(diff / 60);
    if (m < 60) {
      return m + ' phút ' + s + ' giây trước';
    } else {
      h = Math.floor(diff / 60 / 60);
      if (h < 24) {
        m = m % 60;
        return h + ' giờ ' + m + ' phút trước';
      } else {
        h = h % 24;
        d = Math.floor(diff / 60 / 60 / 24);
        return d + ' ngày ' + h + ' giờ trước';
      }
    }
  }
}
//viết hàm lấy api data
var old_fire = 0;
function autoGetData() {
  $.get('/api/fire',
  function (json) {
      var z = json.data;
      var mp3 = 0;
      var zone_fire = [];
      var st = time_diff(json.time)
      $('#time-update').html(st);
      var txt = [];
      for (var i = 0; i < z.length && i < MAX_ZONE; i++) {
        fire[i + 1] = (z[i] == 1);
        if (fire[i + 1]) {
          mp3 = 1;
          zone_fire.push(NAME_MAP[i + 1]);
          $(`li[data-index=${i + 1}]`).addClass("fire");  //màu báo cháy
          txt.push(NAME_MAP[i + 1]); // cho các zone đang cháy vào mảng
        } else {
          setColor(i, COLOR_MAP_OK[i]); //về màu bình thường
          $(`li[data-index=${i + 1}]`).removeClass("fire");
        }
      }
      if (!mp3 && delay_back > 0) {
        delay_back--;
        //console.log(delay_back)
        if (!haveFire) {
          if (delay_back > 0) {
            $('#cmdTest').html('Show ' + delay_back + 's');
            delta_cong = 0.1;
          }
          else {
            $('#cmdTest').html('Hide');
            delta_cong = 0.01;
          }
        } else {
          delay_back = 0;
          delta_cong = 0.1;
          $('#cmdTest').html('Hide');
        }
        if (delay_back == 0) {
          $('#cmdTest').html('Hide');
          show_hide_gui(haveFire);
        }
      }

      if (haveFire != mp3) {
        haveFire = mp3;
        if (delay_back <= 0) {
          show_hide_gui(haveFire);
        }
      }
      if (mp3) {
        old_fire = mp3;
        //có cháy
        var txt_run = txt.join(', ');               //ghép lại
        txt_run = "Chú ý có cháy tại: " + txt_run;  //tạo chữ
        say_vn(txt_run);                            //nói tiếng việt
        $('#txt-run').html(txt_run);                //đẩy chữ cảnh báo chữ chạy lên giao diện
        $('#zone_txt_run').show();                  //hiển thị chữ trên nền đỏ
      } else {
        //hết cháy
        if (old_fire && !playing) {
          say_vn('Đã hết cháy!')                    //nói tiếng việt đã hết cháy
          old_fire = mp3;
          show_hide_gui(false);
        }
        $('#txt-run').html('');                     //xóa txt khi hết cháy
        $('#zone_txt_run').hide();                  //ẩn nền đỏ
      }
    });
}
// variable function
function setColor(i, c) {
  try {
    if (i == -1) return;
    if (window.gltf.scene.children[i].type == 'Group') return;
    window.gltf.scene.children[i].material.color.setHex(c);
  } catch (e) {
    //console.log('setColor i=' + i + ' error=' + e.message);
  }
}
function setVisible(i, v) {
  if (i == -1) return;
  if (window.gltf.scene.children[i].type == 'Group') return;
  window.gltf.scene.children[i].material.visible = v;
}
function setScale(i, y) {
  if (i == -1) return;
  if (window.gltf.scene.children[i].type == 'Group') return;
  var x = window.gltf.scene.children[i].scale.x;
  if (y == null) y = SY[i];
  var z = window.gltf.scene.children[i].scale.z;
  window.gltf.scene.children[i].scale.set(x, y, z);
}
function setPosition(i, x, y, z) {
  if (i == -1) return;
  if (window.gltf.scene.children[i].type == 'Mesh') return;
  window.gltf.scene.children[i].position.set(x, y, z);
}
function setTransparent(i, v) {
  try {
    var obj = gltf.scene.children[i];
    var m = obj.material;
    m.side = 2;
    m.transparent = v;
  } catch (e) {
    console.log('setTransparent i=' + i + ' v=' + v + ' error=' + e, e, obj, m)
  }
}
function setOpacity(i, v) {
  var obj = gltf.scene.children[i];
  var m = obj.material;
  try {
    m.opacity = v;
  } catch (e) {
    console.log('setOpacity i=' + i + ' v=' + v + ' error=' + e, e, obj, m)
  }
}

function init_map() {
  goViewHome();
  //for (var i = 0; i < gltf.scene.children.length; i++)console.log([i,gltf.scene.children[i].userData.name])
  window.COLOR_MAP_OK = COLOR_MAP_OK;
  for (var i = 0; i < gltf.scene.children.length; i++) {
    var item = gltf.scene.children[i];
    //console.log(i,item.type);
    if (item.type == 'Group') {
      //console.log(i, item.type, item);
      COLOR_MAP_OK[i] = 0;
      ;//ko lam gi
    } else if (item.type == 'Mesh') {
      COLOR_MAP_OK[i] = item.material.color.getHex();
      //console.log(i,item.type,item);
      setTransparent(i, true);
      if (item.name.startsWith('Zone')) {
        setOpacity(i, 0.7)
        var stt;
        if(item.name.substr(-1)=='M')stt=(item.name.substr(-2)[0]) * 1;
        else stt = item.name.substring(4) * 1;
        ZONE_MAP_INDEX[stt] = i;
        //console.log([i,stt,item.name]);
      } else {
        setOpacity(i, 0.8)
      }
    }
  }
  ZONE_MAP_INDEX=[0,42,25,38,24,37,26,23,53,51,22,52,62,88,89,36,27,54,41,40,94,39,90];

  /*return;
  COLOR_MAP_OK[22] = COLOR_MAP_OK[23] = 0x9F8C91;
  opa[22] = opa[23] = 0.1;
  for (var j = 0; j < ZONE_NAME_FIX.length; j++) {
    ZONE_MAP_INDEX[j] = -1;
    HH[j] = 1;
    SY[j] = 1;
    opa[j] = 0.78;
    opa[61] = 0.05;
    for (var i = 0; i < gltf.scene.children.length; i++) {
      if (ZONE_NAME_FIX[j] == gltf.scene.children[i].userData.name) {
        ZONE_MAP_INDEX[j] = i;
        if (j > 23) {
          COLOR_MAP_OK[j] = gltf.scene.children[i].material.color.getHex();
        }
        SY[j] = window.gltf.scene.children[i].scale.y * 1;
        if (SY[j] < 1) SY[j] = 1;
        //if (j < 22) SY[j] = SY[j]*1.04;
        break;
      }
    }
  }
  window.COLOR_MAP_OK = COLOR_MAP_OK;
  //console.log(SY)
  //setVisible(1, 0); //phòng bảo vệ ẨN ĐI

  
  COLOR_MAP_OK[22] = COLOR_MAP_OK[23] = 0x9F8C91;
  opa[22] = opa[23] = 0.1;
  for (var i = 0; i < gltf.scene.children.length; i++) {
    setColor(ZONE_MAP_INDEX[i], COLOR_MAP_OK[i]);
    setTransparent(ZONE_MAP_INDEX[i], true);
    setOpacity(ZONE_MAP_INDEX[i], opa[i]);
  }
  gltf.scene.children[16].material.opacity = 0.5;
  /**/
  const MaxStep = 30;
  timer = setInterval(function () {
    var hv = false;
    for (var i = 1; i <= MAX_ZONE; i++) {
      hv = hv || HOVER[i];
      if (hv) break;
    }
    if (!haveFire && hv == false) return;
    flag = (flag + 1) % (MaxStep + 1);
    for (var i = 1; i <= MAX_ZONE; i++) {
      var s0 = 1;
      var k = (s0 * 0.2 / MaxStep);
      if (fire[i] || HOVER[i]) {
        if (flag < MaxStep / 2) {
          var c = HOVER[i] ? 0xFE11FF : COLOR_FIRE1;
          setColor(ZONE_MAP_INDEX[i], c);
          //var s = s0 + flag * k * HH[i];
          //setScale(ZONE_MAP_INDEX[i], s);
        } else {
          var c = HOVER[i] ? 0xFE11FF : COLOR_FIRE2;
          setColor(ZONE_MAP_INDEX[i], c);
          //var s = s0 + (MaxStep - flag) * k * HH[i];
          //setScale(ZONE_MAP_INDEX[i], s);
        }
      } else {
        var id = ZONE_MAP_INDEX[i];
        setColor(id, COLOR_MAP_OK[id]);
        //setOpacity(ZONE_MAP_INDEX[i],opa[i]);
        //setScale(ZONE_MAP_INDEX[i], null);
      }
    }
  }, 24);

  var timerAPI = setInterval(function () {
    autoGetData();
  }, 1000);

  var chieu_quay = 1;
  var timerFun = setInterval(function () {
  	  /*
    var o1 = gltf.scene.children[84].rotation;
    var o2 = gltf.scene.children[85].rotation;
    if (chieu_quay > 0) {
      o1.y += delta_cong;
      o2.y += delta_cong;
      if (o1.y > 3.14159) chieu_quay = -chieu_quay;
    } else {
      o1.y -= delta_cong;
      o2.y -= delta_cong;
      if (o1.y < 0.01) chieu_quay = -chieu_quay;
    }
    /**/
  }, 100);
  
}
var isRotate3d = localStorage.getItem('quay');
doRotate3d();
var isListZone3d = localStorage.getItem('list');
doListZone3d();
function doListZone3d() {
  if (isListZone3d == null || isListZone3d != 1) isListZone3d = 0; else isListZone3d = 1;
  localStorage.setItem('list', isListZone3d);
  if (isListZone3d) {
    $('#ds_zone_3d').show();
  } else {
    $('#ds_zone_3d').hide();
  }
}
function ListZone3d() {
  isListZone3d = !isListZone3d;
  doListZone3d();
}
function doRotate3d() {
  if (isRotate3d == null || isRotate3d != 1) isRotate3d = 0; else isRotate3d = 1;
  localStorage.setItem('quay', isRotate3d);
  controls.autoRotate = isRotate3d;
}
function Rotate3d() {
  isRotate3d = !isRotate3d;
  doRotate3d();
}
function get_name_zone() {
  $.get('/api/get_zone_name',
  function (json) {
      for (var i = 1; i <= MAX_ZONE; i++) {
        NAME_MAP[json['s'+i]] = json['z' + i];
      }
      var s = '';
      s += '<ul id="ds_zone_3d">';
      for (var i = 1; i <= MAX_ZONE; i++) {
        s += '<li class="list-zones" data-index="' + (json['s'+i]) + '">' + json['z' + (i)] + '</li>';
      }
      s += '</ul>';
      $('#list-zone').html(s);
      $('li.list-zones').hover(function () {
        var id = $(this).data('index');
        HOVER[id] = 1;
      });
      $('li.list-zones').mouseout(function () {
        var id = $(this).data('index');
        HOVER[id] = 0;
      });
      doListZone3d();
    });
}
var haveFire = false;
//var hiddenItems = ['NhaA', 'NhaB', 'KhuVeSinh', 'MaiCheSauNhaA', 'NhaXe', "KhoContainer", "NhaRac", "HanhLang","CotDien"];
var hiddenItems = ['NhaRac','VachQuaDuong','CauThang','CotDen_G1','CotDen_G2','CotDen_G3','CotDen_G4','Cube006','Cube009','Grass_01','Glass_01','Glass_02','Glass_03','Glass_04','Glass_05','NhaA_01','NhaA_02','NhaA_03','NhaA_KinhTang1','NhaA_MaiChe','MaiChe_01','MaiChe_02','MaiChe_03','MaiChe_04','MaiCheSauNhaA','MaiCheSauNhaA001','Cua1','Cua2','Cua3','Cua4','Cua4001','Cua5','Cua6','Cua7','TenNhaMay_01','TenNhaMay_02','TenNhaMay_03','TenNhaMay_04','Cube006','NhaPhuTro','NhaXe_Cu','NhaXe_Moi','ChoiHutThuoc','KhoCotainer','Container'];
var showItems = ['Zone', 'txtZone','GasDetect_Z3','GasDetect_Z4'];
var delay_back = 0;
var _haveFire = false;
function Fn_test() {
  _haveFire = !_haveFire;
  delay_back = _haveFire ? 30 : 0;
  if (delay_back == 0) delta_cong = 0.01;
  show_hide_gui(_haveFire);
}
function show_hide_gui(haveFire) {
  var cmd = document.getElementById('cmdTest');
  cmd.innerHTML = haveFire ? "Hide" : "Show";
  for (var i = 0; i < gltf.scene.children.length; i++) {
    var item = gltf.scene.children[i];
    var name = item.name;
    var t = false;
    for (var txt of hiddenItems)
      t = t || name.startsWith(txt);
    if (t) {
      item.visible = !haveFire;
      //console.log([i,name,t,item.material]);
    } else {
      for (var txt of showItems)
        t = t || name.startsWith(txt) ;
      if (t) {
        item.visible = haveFire;
      } else {
        //console.log([i,name,t,item.material]);
      }
    }
  }
}
get_name_zone();

window.goViewHome = goViewHome;
window.setColor = setColor;
window.setOpacity = setOpacity;
window.Rotate3d = Rotate3d;
window.ListZone3d = ListZone3d;
window.Fn_test = Fn_test;
window.NAME_MAP=NAME_MAP;