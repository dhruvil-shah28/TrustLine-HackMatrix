import codecs
with codecs.open('src/app/login/page.tsx', 'r', 'utf-8') as f:
    text = f.read()

text = text.replace('className="mx-auto min-[900px]:mx-0"', 'className="mx-auto min-[900px]:mx-0 min-[1200px]:translate-x-[max(0px,calc((100vw-1280px)/2-48px))]"')

with codecs.open('src/app/login/page.tsx', 'w', 'utf-8') as f:
    f.write(text)
