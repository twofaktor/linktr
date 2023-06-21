import { RelayPool } from "nostr-relaypool";
import { nip19, utils } from "nostr-tools";
import React, {useEffect, useMemo, useState } from "react";
import EventListComponent from './EventListComponent';
import { NostrLogo } from "../graphics/index.js";

const Nostr = () => {
  const [events, setEvents] = useState([]);
  const [uniqueEvents, setUniqueEvents] = useState(new Set());

  const relayList = useMemo(() => [
    "wss://nostr.multinywallet.com",
    "wss://nostr-pub.wellorder.net",
    "wss://relay.punkhub.me",
    "wss://relay.snort.social",
    "wss://bitcoiner.social",
    "wss://relay.nostriches.org",
    "wss://relay.orangepill.dev",
    "wss://relay.nostr.band",
    "wss://eden.nostr.land",
    "wss://relay.nostr.scot",
  ], []);

  const getHexPubKey = (inNpub) => {
    switch (true) {
      case !inNpub && process.env.REACT_APP_NOSTR_PUBKEY?.startsWith("npub1"):
        return nip19.decode(process.env.REACT_APP_NOSTR_PUBKEY).data;
      case inNpub:
        return process.env.REACT_APP_NOSTR_PUBKEY;
      default:
        return process.env.REACT_APP_NOSTR_PUBKEY;
    }
  };
  
  const NOTES_TO_SHOW = parseInt(process.env.REACT_APP_NOSTR_NOTES_TO_SHOW);
  useEffect(() => {
    const onLoad = () => {
      const relayPool = new RelayPool(relayList);

      relayPool.subscribe(
        [
          {
            kinds: [3,10002],
            authors: [getHexPubKey()],
          },
        ],
        relayList,
        (event, isAfterEose, relayURL) => {
          let objRelays = [];
          const objRecommendedRelays = [];
          try {
            if (event.kind === 3) {
              objRelays = Object.keys(JSON.parse(event.content));
            }}catch (error) {
              console.error(error);
            }
            event.tags.forEach(tag => {
              if (tag[0] === "r") {
                objRecommendedRelays.push(tag[1]);
              }
            });
            const userRelayList = [...objRelays, ...objRecommendedRelays];
          relayPool.subscribe(
            [
              {
                kinds: [0],
                authors: [getHexPubKey()],
                limit:1,
              },
              {
                kinds: [1],
                authors: [getHexPubKey()],
                // since: (Math.floor((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)) / 1000)),
                limit:NOTES_TO_SHOW,
              },
            ],
            userRelayList,
            (event, isAfterEose, relayURL) => {
              if (!uniqueEvents.has(event.id)) {
                setUniqueEvents(new Set(uniqueEvents.add(event.id)));
                  setEvents(events =>
                    utils.insertEventIntoDescendingList(events, event))
              }
              //console.log(event, isAfterEose, relayURL);
            },
            undefined,
            (events, relayURL) => {
              //console.log(events, relayURL);
            }
          );
        },
        undefined,
        (events, relayURL) => {
          //console.log(events, relayURL);
        }
      );
        
      relayPool.onerror((err, relayUrl) => {
        console.log("RelayPool notice", err, " from relay ", relayUrl);
      });
      relayPool.onnotice((relayUrl, notice) => {
        console.log("RelayPool notice", notice, " from relay ", relayUrl);
      });
      return () => {
        relayPool.close();
      };
    };
    
    window.onload = onLoad;

    return () => {
      window.onload = null;
    };
  }, []);
  return (
    
    <div>
      <div>
      <br>
      <h3>Nostr</h3>
      <br>
      <EventListComponent events={events} />
      <button><a href={process.env.REACT_APP_NOSTR_OUTER_PROFILES+nip19.npubEncode(getHexPubKey())} target="_blank" rel="noreferrer">More...</a></button>
      </div>
    </div>
  );
};

export default Nostr;
