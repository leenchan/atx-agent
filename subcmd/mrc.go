package subcmd

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/alecthomas/kingpin"
	"github.com/dolfly/mr"
)

var (
	server string
	passwd string
	sport  int64
	domain string
	client string
	cpath  string
	cport  int64

	tcpto int64
	tcpdl int64
	udpto int64
	udpdl int64
)

func RegisterMrc(mrc *kingpin.CmdClause) {
	mrc.Flag("server", "server address. ex: 0.0.0.0:7000").Short('s').Default("ss.diele.me:7000").StringVar(&server)
	mrc.Flag("password", "server password.").Short('p').Default("").StringVar(&passwd)
	mrc.Flag("sport", "server port").Required().Short('P').Int64Var(&sport)
	mrc.Flag("domain", "server domain.").Short('D').Default("").StringVar(&domain)
	mrc.Flag("client", "client address. ex: 127.0.0.0:7912").Short('c').Default("127.0.0.1:7912").StringVar(&client)

	mrc.Flag("cpath", "client path.").Short('d').Default("/sdcard/tmp").StringVar(&cpath)
	mrc.Flag("cport", "client port.").Short('t').Default("7912").Int64Var(&cport)

	mrc.Flag("ttimeout", "tcp timeout.").Default("60").Int64Var(&tcpto)
	mrc.Flag("tdeadline", "tcp deadline.").Default("0").Int64Var(&tcpdl)
	mrc.Flag("utimeout", "udp timeout.").Default("60").Int64Var(&udpto)
	mrc.Flag("udeadline", "udp deadline.").Default("0").Int64Var(&udpdl)
}

func DoMrc() error {
	if server == "" || passwd == "" || (sport == 0 && domain == "") {
		log.Fatal("must set server and password")
		return nil
	}
	if client == "" && cpath == "" {
		log.Fatal("must set client or cpath")
		return nil
	}
	s := mr.NewClient(server, passwd, sport, domain, client, tcpto, tcpdl, udpdl)
	go func() {
		sigs := make(chan os.Signal, 1)
		signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
		<-sigs
		s.Shutdown()
	}()
	return s.ListenAndServe()
}
