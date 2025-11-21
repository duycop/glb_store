$(document).ready(function () {
  const api = '/api/';
  var logined = false, user_info;
  var where='home';
  
  /*--Cookie---------------------------------------*/
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
  function getLocal(name) {
    return window.localStorage.getItem(name);
  }
  function setLocal(name, value) {
    window.localStorage.setItem(name, value);
  }
  function delLocal(name) {
    localStorage.removeItem(name);
  }
  function set_store(key,value){
    setCookie(key,value,30);
    setLocal(key,value);
  }
  function get_store(key) {
    let value = getCookie(key);
    if (value == null || value == '' || value === undefined) {
      value = getLocal(key);
    }
    if (value === undefined) value = ''
    return value;
  }
  /**-------------end cookie---------------*/
  const MAX_ZONE = 22;

  function time_diff(t) {
    var dt2 = new Date();
    var dt1 = new Date(t);
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff = (diff < 0) ? 0 : Math.floor(diff);
    var d, h, m, s;
    s = diff % 60;
    if (diff < 60) {
      return s + ' giây trước';
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
  var NAME_MAP = [];
  function get_name_zone() {
    $.get('/api/get_zone_name',
      function (json) {
        for (var i = 1; i <= MAX_ZONE; i++) {
          NAME_MAP[i - 1] = json['z' + i];
        }
        var timerAPI = setInterval(function () {
          if(where != 'fire')
          	autoGetData();
        }, 1000)
      });
  }

  function autoGetData() {
    $.get('/api/fire',
      function (json) {
        var st = time_diff(json.time)
        $('.time-update').html(st);
        var z = json.data;
        for (var i = 0; i < z.length && i < MAX_ZONE; i++) {
          if (z[i] == 1) {
            $('#ilz' + (i + 1)).attr('src', '/images/do.png');
          } else {
            $('#ilz' + (i + 1)).attr('src', '/images/xanh.png');
          }
        }
      });
  }

  function random(value, min, max) {
    var rnd = Math.random();
    if (rnd <= 0.3333) value -= 0.1;
    else if (rnd >= 0.6666) value += 0.1;
    if (value > max) value = max;
    if (value < min) value = min;
    return value.toFixed(1);
  }
  var water_sensor;
  function genWater() {
    var old_sensor = $('#ds-cam-bien').val();
    $.get('/api/get_water_sensor',
      function (json) {
        data = json.data;
        water_sensor = data;
        /**
         * {
        "id": 3,
        "name": "pH",
        "unit": "",
        "min": 5.5,
        "max": 9,
        "value": 0,
        "sos": "0}
         * */

        var s = '';
        s += 'Cập nhật: <span class="time-update"></span>';
        s += '<div class="table-responsive"><table class="table"><thead>';
        s += '<tr class="table-info">';
        s += '<td><b>Thông số</b></td>';
        s += '<td align="right"><b>Giá trị</b></td>';
        s += '<td align="right"><b>Min</b></td>';
        s += '<td align="right"><b>Max</b></td>';
        s += '<td><b>Đơn vị</b></td>';
        s += '</tr>';
        s += '</thead><tbody>';

        var ds_cam_bien = '';
        for (var item of data)if(item.active) {
          ds_cam_bien += '<option value="' + item.id + '">Cảm biến ' + item.name + '</option>';


          if (item.sos)
            s += '<tr id="rwz-' + item.id + '" class="table-danger">';  //báo màu đỏ
          else
            s += '<tr id="rwz-' + item.id + '">';

          s += '<td>' + item.name + '</td>';
          s += '<td id="wz-' + item.id + '" align="right">' + item.value + '</td>';
          s += '<td align="right">' + item.min + '</td>';
          s += '<td align="right">' + item.max + '</td>';
          s += '<td>' + item.unit + '</td>';
          s += '</tr>';
        }
        s += '</tbody></table></div>';
        $('#z-water').html(s);
        $('#ds-cam-bien').html(ds_cam_bien);

        //nạp min max vào
        $('select#ds-cam-bien').on('change', function () {
          var id = $(this).val();
          for (var item of data) {
            if (item.id == id) {
              $('#w-min').val(item.min);
              $('#w-max').val(item.max);
              break;
            }
          }
        });

        if (old_sensor != null && old_sensor != '') {
          $('select#ds-cam-bien').val(old_sensor);
        } else {
          var item = data[0];
          $('#w-min').val(item.min);
          $('#w-max').val(item.max);
        }

        var timerRandom = setInterval(function () {
        	if(where!='water')return;
        	$.get('/api/water',
				function (json) {
					data = json.data;
					water_sensor = data;
					//lấy từ API sau này ra data thật từ action=get_water_sensor_quick
			          for (var item of data) {
			            var v0 = item.value;
			            var v1=v0,v2=v0;
			            v2=Math.round(v0*100)/100
			            $('#wz-' + item.id).text(v2);
			            if (v2 > item.max || v2 < item.min) {  //khi thật dùng item.sos , ko cần so sánh nữa
			              $('#rwz-' + item.id).addClass('table-danger');
			            } else {
			              $('#rwz-' + item.id).removeClass('table-danger');
			            }
			          }
				})
        }, 3000)
      });


  }
  function genAbout() {
    //var s = '<div class="about-app"><p><img width="200px" src="images/logo3.png"/></p><p class="app-name">PHẦN MỀM CẢNH BÁO CHÁY<br />VÀ<br />QUẢN LÝ HỆ THỐNG NƯỚC THẢI</p><hr /><p class="app-version">Phiên bản: 1.0<br />Phát triển bởi: Ces Holdings Vina<br/>HOTLINE SALE: <a href="tel:+842462512075">+84.2462512075</a></p><div class="show-after-login" style="display:none"><hr><p id=user-info></p><button class="btn btn-danger" id="cmdLogout">Logout</button></div></div>';
    //$('#z-about').html(s);
    //$('#cmdLogout').click(function () { do_logout(); });
  }
  $('#cmdTest').click(function () {
    try {
      if (window.mo_rong)
        window.mo_rong.test('Fire Alarm (test only)', 'Zone5m, Zone KTX');
    } catch (e) {
      console.log(e.message);
    }
  });
  function load3d(load) {
    if (load)
      $('#ifr3dapp').attr('src', '/app/3d/index.html?m=251117');
    else
      $('#ifr3dapp').attr('src', '');
    $('#tudien').attr('src', '');
  }
  $('.cmdFire').click(function () {
  	where='fire';
    $('#img_logo').attr('src', "images/fire-icon.png")
    $('#tieu-de').html('HỆ THỐNG BÁO CHÁY');
    $('.z-item').hide();
    $('#z-fire').show();
    load3d(true);
  });
  $('.cmdWater').click(function () {
  	where='water';
    $('#img_logo').attr('src', "images/water-icon.png")
    $('#tieu-de').html('THÔNG SỐ NƯỚC THẢI');
    $('.z-item').hide();
    $('#z-water').show();
    load3d(false);
  });
  $('#cmdSetting').click(function () {
  	where='setting';
    $('#img_logo').attr('src', "images/setting-icon.png")
    $('#tieu-de').html('CÀI ĐẶT HỆ THỐNG');
    $('.z-item').hide();
    $('#z-setting').show();
    load3d(false);
  });
  $('.cmdTienIch').click(function () {
  	where='tienich';
    $('#img_logo').attr('src', "images/tien-ich-icon.png")
    $('#tieu-de').html('GIÁM SÁT TỦ ĐIỆN');
    $('.z-item').hide();
    $('#z-tienich').show();
    load3d(false);
    $('#tudien').attr('src', "/tudien/app.html");
  });
  $('#cmdAbout').click(function () {
  	where='about';
    $('#img_logo').attr('src', "images/about-icon.png")
    $('#tieu-de').html('GIỚI THIỆU PHẦN MỀM');
    $('.z-item').hide();
    $('#z-about').show();
    load3d(false);
    get_version();
  });

  //setting code
  $('#cmd-fire-setting').click(function () {
    $('#tab-fire').show();
    $('#tab-water').hide();
  });
  $('#cmd-water-setting').click(function () {
    $('#tab-fire').hide();
    $('#tab-water').show();
  });

  isAdv = 0;
  doShowAdv();
  function doShowAdv() {
    if (isAdv) {
      $('tr.row-adv').show("slow", function () {
        $('#cmd-show-adv')[0].scrollIntoView({
          behavior: "smooth", // or "auto" or "instant"
          block: "start" // or "end"
        });
      });
      $('#cmd-show-adv').html('Hide Advance');
    } else {
      $('tr.row-adv').hide("slow");
      $('#cmd-show-adv').html('Show Advance');
    }
  }

  $('#cmd-show-adv').click(function () {
    isAdv = !isAdv;
    doShowAdv();
  });

  const ZONE_NUM = 22;
  var ZONE_NAME;
  function show_list_zone() {
    $.get('/api/get_zone_name',
      function (json) {
        ZONE_NAME = json;
        var s = '';
        s += '<table class="table table-hover table-striped">';
        s += '<thead><tr class="table-info">';
        s += "<th>#</td>";
        s += "<th>ZoneID</td>";
        s += "<th>ZoneName</td>";
        s += "<th>Action</td>";
        s += '</tr></thead><tbody>';
        for (var i = 1; i <= ZONE_NUM; i++) {
          s += '<tr>';
          s += '<td>' + i + '</td>';
          s += '<td>' + ZONE_NAME['i' + i] + '</td>';
          s += '<td>' + ZONE_NAME['z' + i] + '</td>';
          s += '<td><button class="btn btn-sm btn-info cmd-change-name-zone" data-index="' + i + '">Change</button></div></td>';
          s += '</tr>';
        }
        s += '</tbody></table>';
        $('#fire-setting-table').html(s);

        $('.cmd-change-name-zone').click(function () {
          var i = $(this).data('index');
          if (user_info.role == 100 || user_info.role == 13 || user_info.role == 23)
            change_name_zone(i);
          else
            toastr["warning"]("Bạn không có quyền!");
        });
      });
  }
  function change_name_zone(id) {
    let dialog = $.confirm({
      lazyOpen: true,
      closeIcon: true,
      title: 'Đổi tên Zone',
      content: '' +
        '<div class="form-group">' +
        '<label>Tên mới:</label>' +
        '<input id="new-zome-name" type="text" placeholder="Enter New name" class="form-control" value="' + ZONE_NAME['z' + id] + '" required />' +
        '</div>',
      escapeKey: 'cancel',
      buttons: {
        ok: {
          text: 'Submit',
          btnClass: 'btn-blue cmd-submit',
          action: function () {
            var name = $('#new-zome-name').val();
            $.post(api,
              {
                action: 'change_zone_name',
                id: id,
                name: name
              },
              function (data) {
                var json = JSON.parse(data);
                if (json.ok) {
                  var old_name = ZONE_NAME['z' + id]
                  if (json.name == old_name) {
                    toastr["warning"]("Tên vẫn như cũ, không đổi!<br>Tên vẫn là: <b>" + old_name + "</b>");
                  } else {
                    show_list_zone();
                    toastr["success"]("Đã đổi tên thành công:<br>Tên cũ: <b>" + old_name + "</b><br>Tên mới: <b>" + json.name + "</b>");
                  }
                } else {
                  toastr["warning"](json.error);
                }
              });
          }
        },
        cancel: {
          btnClass: 'btn-red',
          action: function () {

          }
        }
      }
    });
    dialog.open();
  }

  $('#cmd-save-setting-sensor').click(function () {
    //gửi setting water sensor
    if (!(user_info.role == 100 || user_info.role == 13 || user_info.role == 23)) {
      toastr["warning"]("Bạn không có quyền!");
      return;
    }

    var min = $('#w-min').val();
    var max = $('#w-max').val();
    let ck = get_store('ck');
    let uid = get_store('uid');
    $.post(api,
      {
        action: "save_setting_water",
        uid: uid,
        ck: ck,
        id: $('#ds-cam-bien').val(),
        min: min,
        max: max,
      },
      function (data) {
        var json = JSON.parse(data);
        if (json.ok) {
          toastr["success"](json.msg);
          genWater(); //gen lại bảng water sensor
        } else {
          toastr["warning"]("Có lỗi! " + json.msg);
        }
      })
  });
  //end setting code

  //window.mo_rong.quitgame()  : thoát app + service

  $('.bat-tat-thong-bao').click(function () {
    var v = $(this).val();
    if (v == "1") {
      toastr["success"]("Bật thông báo cháy!");
      window.mo_rong.bat_thong_bao();
    } else {
      toastr["warning"]("Tạm thời tắt thông báo khi có cháy");
      window.mo_rong.tat_thong_bao();
    }
  });

  $('.quick-fire-or-water').click(function () {
    var v = $(this).val();
    setLocal("quick", v);
    setCookie("quick", v);
    var str = '';
    if (v == "fire")
      str = "Truy cập nhanh vào báo cháy";
    else if (v == "water")
      str = "Truy cập nhanh vào quản lý nước thải";
    else
      str = "Hỏi lại mỗi lần truy cập";
    toastr["success"]("Đã cài đặt:<br>" + str);
  });

  function init_quick() {
    var q = get_store("quick");
    if (q == "fire") {
      $('#quick-fire').prop("checked", true);
    } else if (q == "water") {
      $('#quick-water').prop("checked", true);
    } else {
      $('#quick-none').prop("checked", true);
    }
  }

  init_quick();

  function do_login() {
    let uidck = get_store('uid');
    if (!uidck) uidck = '';
    if (uidck === undefined) uidck = '';
    let dialogLogin = $.confirm({
      lazyOpen: true,
      title: '<i class="fa fa-key" aria-hidden="true"></i> Đăng nhập',
      content: '' +
        '<form action="" class="formName">' +
        '<div class="form-group">' +
        '<label>Username:</label>' +
        '<input type="text" class="uid form-control" value="' + uidck + '" required />' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Password:</label>' +
        '<input type="password" class="pwd form-control" required />' +
        '</div>' +
        '</form>',
      escapeKey: 'cancel',
      buttons: {
        formSubmit: {
          text: 'Login',
          btnClass: 'btn-blue cmd-submit',
          action: function () {
            let uid = this.$content.find('.uid').val();
            let pwd = this.$content.find('.pwd').val();
            if (uid == '') {
              this.$content.find('.uid').focus();
              return false;
            }
            if (pwd == '') {
              this.$content.find('.pwd').focus();
              return false;
            }
            let dialog_wait_login = $.confirm({
              title: 'Submit and Process...',
              content: 'Please wait a few second...',
              buttons: {
                ok: {}
              }
            });
            $.post('/api/login',
              {
                uid: uid,
                pwd: pwd,
              },
              function (json) {
                dialog_wait_login.close();
                logined = json.ok;
                if (logined) {
                  user_info = json;
                  load_gui();
                  localStorage.logined = JSON.stringify(json);
                  set_store('uid',json.uid);
                  set_store('ck',json.ck);                  
                  dialogLogin.close();
                } else {
                  load_gui();
                  $.confirm({
                    title: 'Warning',
                    escapeKey: 'ok',
                    content: json.msg,
                    autoClose: 'OK|5000',
                    escapeKey: 'OK',
                    buttons: {
                      OK: {
                        text: 'Close',
                        keys: ['enter', 't'],
                        btnClass: 'btn-red',
                        action: function () {
                        }
                      },
                    },
                    onDestroy: function () {
                      dialogLogin.$content.find('.pwd').focus();
                    }
                  })
                }
              });
            return false;
          }
        },
        cancel: {
          text: 'Thoát',
          btnClass: 'btn-red',
          action: function () {
            do_quitgame();
          }
        },
      },
      onClose: function () {
        $('#cmdLogin').removeClass("active");
      },
      onContentReady: function () {
        //$('#cmdLogin').addClass("active");
        let self = this;
        let uid = get_store('uid');
        if (uidck == '')
          self.$content.find('.uid').focus();
        else
          self.$content.find('.pwd').focus();
        self.$content.find('.uid').keyup(function (event) {
          if (event.keyCode === 13) {
            if (self.$content.find('.uid').val() == '')
              this.$content.find('.uid').focus();
            else
              self.$content.find('.pwd').focus();
          }
        });
        self.$content.find('.pwd').keyup(function (event) {
          if (event.keyCode === 13) {
            if (self.$content.find('.uid').val() == '')
              this.$content.find('.uid').focus();
            else if (self.$content.find('.pwd').val() == '')
              this.$content.find('.pwd').focus();
            else {
              let x = $.find('.cmd-submit');
              x[0].click();
            }
          }
        });
      }
    });
    dialogLogin.open();
  }
  function do_logout() {
    $.get('/api/logout',
      function (data) {
        let json = JSON.parse(data);
        if (json.ok) {
          logined = false;
          eraseCookie('ck');
          do_quitgame();
        }
      });
  }
  function check_login() {
    let ck = get_store('ck');
    let uid = get_store('uid');
    if (ck != null && uid != null) {
      $.get('/api/check_logined',
        function (json) {
          logined = json.ok;
          if (logined) {
            user_info = json;
            localStorage.logined = JSON.stringify(json);
            set_store('uid',json.uid);
            set_store('ck',json.ck);
            load_gui();
          } else {
            do_login();
          }
        });
    } else {
      logined = false;
      do_login();
    }
  }
  function load_gui() {
    if (logined) {
      show_list_zone();
      get_name_zone();
      genWater();
      $('.show-after-login').show();
      $('#user-info').html("Xin chào " + user_info.uid );

      //CHỌN FIRE OR WATER: z-home show lên
      var q = get_store("quick");
      if (q == "fire") {
        $('.cmdFire').click(); //click bằng code lần đầu
      } else if (q == "water") {
        $('.cmdWater').click(); //click bằng code lần đầu
      } else {
        $('#img_logo').attr('src', "images/logo3.png")
        $('#tieu-de').html('<span style="font-size:14px">HỆ GIÁM SÁT AN TOÀN MÔI TRƯỜNG</span>');
        $('.z-item').hide();
        $('#z-home').show();
      }
      /**/
    } else {
      location.href = "/app/";
    }
  }
  function do_quitgame() {
    //window.mo_rong.quitgame();
    try {
      toastr["success"]("Bye bye!");
      window.mo_rong.quitgame()  //: thoát app + service
    } catch (e) {
      toastr["warning"]("Lỗi gì đó: " + e.message);
      //location.reload(); // tải lại trang cho ra hộp login
    }
  }
  check_login();
  genAbout();
  $('#cmdLogout').click(function () { do_logout(); });
  //fix độ cao ifr3dapp theo điên thoại
  $('#ifr3dapp').height((window.innerHeight - 60 - 55) + '.px');

  //get version in android
  function get_version() {
    var version;
    var versionName = '';
    try {
      var json_ver = window.mo_rong.get_version();
      var json = JSON.parse(json_ver);
      versionName = json.versionName;
    } catch (ex) {
      versionName = '3.2';
    }
    version = 'Version: ' + versionName;

    $('#app-version').html(version);

    $.ajax({
      url: '/app/version.txt?rnd='+Math.random(),
      dataType: 'text',
      success: function (new_ver) {
        if (versionName != new_ver) {
          version += ' =&gt; <a href="http://play.google.com/store/apps/details?id=vn.edu.tnut.doosung">Update to ' + new_ver+'</a>';
        }
        $('#app-version').html(version);
      }
    });    
  }
  get_version();
});

function set_radio_thongbao(v) {
  if (v) {
    $('#tat-thong-bao').prop("checked", false);
    $('#bat-thong-bao').prop("checked", true);
    toastr["success"]("Tự động bật chế độ thông báo khi mọi zone đều OK");
  } else {
    $('#bat-thong-bao').prop("checked", false);
    $('#tat-thong-bao').prop("checked", true);
  }
}
