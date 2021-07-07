FROM amazon/aws-lambda-nodejs:14

# RUN dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
# RUN dnf upgrade
RUN yum makecache
RUN yum install -y amazon-linux-extras
RUN amazon-linux-extras install epel -y
# RUN subscription-manager repos --enable "rhel-*-optional-rpms" --enable "rhel-*-extras-rpms"
# RUN yum update
# RUN yum install epel-release -y
RUN yum install -y \
    git redhat-lsb python bzip2 tar pkgconfig atk-devel \
		alsa-lib-devel bison binutils brlapi-devel bluez-libs-devel \
    bzip2-devel cairo-devel cups-devel dbus-devel dbus-glib-devel \
    expat-devel fontconfig-devel freetype-devel gcc-c++ GConf2-devel \
		glib2-devel glibc.i686 gperf glib2-devel gtk2-devel gtk3-devel \
		java-1.*.0-openjdk-devel libatomic libcap-devel libffi-devel \
    libgcc.i686 libgnome-keyring-devel libjpeg-devel libstdc++.i686 \
    libX11-devel libXScrnSaver-devel libXtst-devel \
    libxkbcommon-x11-devel ncurses-compat-libs nspr-devel nss-devel \
    pam-devel pango-devel pciutils-devel pulseaudio-libs-devel \
    zlib.i686 httpd mod_ssl php php-cli python-psutil wdiff --enablerepo=epel


ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY ./package.json ./package-lock.json ./

RUN npm install

COPY . .

RUN mkdir ignore

RUN mkdir -p headlines/ynet headlines/n12 headlines/walla headlines/israelhayom headlines/news13 headlines/haaretz

CMD [ "index-split-sites.lambdaHandler" ]