<html>
<head></head>
<body>
<div style="position:absolute;left:40%;top:45%">
{# 导出 #}
<button onclick="simple()">simple example</button>
<button onclick="complex()">complex example</button>
{# 导入 #}
{# fetch 方式 #}
<input type="file" id="file"/>
<button type="submit" onclick="submit()">submit</button>
{#  #}
{# form表单提交方式 #}
<form method="POST" action="/import" enctype="multipart/form-data"  name="_csrf" value="{{ctx.csrf}}">
  title: <input name="title" />
  file: <input name="file" type="file" />
  <button type="submit">upload</button>
</form>
{#  #}
</div>
</body>
<script>
function simple(){
    window.open('http://127.0.0.1:7001/simple')
}
function complex(){
    window.open('http://127.0.0.1:7001/complex')
}
function submit(){
let excel = document.getElementById("file").files[0]
const data = new FormData();
data.append('file',excel);
fetch('http://localhost:7001/import',{
    method:"post",
    body:data,
})
}
</script>
</html>
