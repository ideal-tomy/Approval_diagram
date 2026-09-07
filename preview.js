const previewImages=[['01.png','照合画面'],['02.png','要確認一覧'],['03.png','承認記録'],['04.png','検査基準の改定']];
document.querySelectorAll('.feature-card .feature-thumb').forEach((el,i)=>{const [file,alt]=previewImages[i];el.classList.add('has-image');el.innerHTML='';const image=document.createElement('img');image.src=`images/${file}`;image.alt=alt;image.loading='lazy';el.append(image);});
