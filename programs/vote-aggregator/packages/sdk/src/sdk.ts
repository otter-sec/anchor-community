import {Program, Provider} from '@coral-xyz/anchor';
import {VoteAggregator, IDL} from './vote_aggregator';
import {Connection, PublicKey} from '@solana/web3.js';
import {RootSdk} from './root';
import {ClanSdk} from './clan';
import {MemberSdk} from './member';

class ReadonlyProvider implements Provider {
  constructor(public connection: Connection) {}
}

export type RealmSide = 'community' | 'council';

export class VoteAggregatorSdk {
  program: Program<VoteAggregator>;

  constructor(
    connection: Connection = new Connection('http://localhost:8899'),
    programId: PublicKey = new PublicKey(
      'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
    )
  ) {
    this.program = new Program(
      IDL,
      programId,
      new ReadonlyProvider(connection)
    );
  }

  get programId(): PublicKey {
    return this.program.programId;
  }

  get connection(): Connection {
    return this.program.provider.connection;
  }

  get root(): RootSdk {
    return new RootSdk(this);
  }

  get clan(): ClanSdk {
    return new ClanSdk(this);
  }

  get member(): MemberSdk {
    return new MemberSdk(this);
  }
}
