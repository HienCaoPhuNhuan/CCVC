window.createCcvcPhotoStage = function createCcvcPhotoStage(reducedMotion) {
  let stage, picture, source, owner;
  let generation = 0;
  return {
    show(image, section) {
      if (!stage) {
        stage = document.createElement('div');
        stage.className = 'photo-stage';
        stage.setAttribute('role', 'img');
        picture = document.createElement('img');
        stage.append(picture);
        document.body.append(stage);
        owner = section;
        owner.classList.add('photos-playing');
      }
      if (source !== image.getAttribute('src')) {
        const first = !source;
        const token = ++generation;
        const from = image.getBoundingClientRect();
        picture.src = image.getAttribute('src');
        picture.alt = image.alt;
        stage.setAttribute('aria-label', image.alt);
        source = image.getAttribute('src');
        picture.decode().then(() => {
          if (token !== generation || !stage || reducedMotion) return;
          const to = picture.getBoundingClientRect();
          const start = first ? {transformOrigin:'0 0', transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`,opacity:.6} : {opacity:.3};
          picture.animate([start,{transformOrigin:'0 0',transform:'none',opacity:1}],{duration:first?650:450,easing:'cubic-bezier(.2,.8,.2,1)'});
        }).catch(() => {});
      }
    },
    stop() {
      generation++;
      stage?.remove();
      owner?.classList.remove('photos-playing');
      stage = picture = source = owner = null;
    }
  };
};
