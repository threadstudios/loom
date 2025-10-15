import { Loom } from "@threadws/loom-core";
import { LoomRestPlugin } from "@threadws/loom-rest";
import { AppModule } from "./app.module";

const app = new Loom({
  modules: [AppModule],
});

app.use(LoomRestPlugin({ withScalar: true }));

app.listen(3165);
