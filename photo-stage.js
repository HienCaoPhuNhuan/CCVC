window.createCcvcPhotoStage = function createCcvcPhotoStage(reducedMotion) {
  let stage, picture, source, owner;
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
        if (!reducedMotion) {
          const from = image.getBoundingClientRect();
          picture.animate([
            {transformOrigin:'0 0',transform:`translate(${from.left}px,${from.top}px) scale(${from.width / innerWidth},${from.height / innerHeight})`,opacity:.6},
            {transformOrigin:'0 0',transform:'none',opacity:1}
          ], {duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
        }
      }
      if (source !== image.getAttribute('src')) {
        picture.src = image.getAttribute('src');
        picture.alt = image.alt;
        stage.setAttribute('aria-label', image.alt);
        if (source && !reducedMotion) picture.animate([{opacity:.3},{opacity:1}],{duration:450});
        source = image.getAttribute('src');
      }
    },
    stop() {
      stage?.remove();
      owner?.classList.remove('photos-playing');
      stage = picture = source = owner = null;
    }
  };
};
